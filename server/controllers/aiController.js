import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import Groq from "groq-sdk";
import fs from "fs";
import pdf from "pdf-parse-fork";
import { calculateATSScore } from "../utils/atsScore.js";


const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


export const generateArticle = async (req, res)=>{
     try {
          const { userId } = req.auth();
          const {prompt, length } = req.body;
          const plan = req.plan;
          const free_usage = req.free_usage;

          if(plan !== 'premium' && free_usage >= 10){
               return res.json({success: false, message: "Limit reached. Upgrade to continue."})
          }

          const response = await AI.chat.completions.create({
          model: "gemini-2.5-flash",
          messages: [
          {
          role: "system",
          content: "You are a professional article writer who writes long, detailed articles."
          },
          {
          role: "user",
          content: `
          Write a detailed article of approximately ${length} words on the topic:

          "${prompt}"

          Requirements:
          - Minimum ${length - 100} words
          - Use headings and subheadings
          - Write in multiple paragraphs
          - Do NOT stop early
          - Do NOT summarize
          `
          }
          ],
          temperature: 0.7,
          max_tokens: Math.floor(length * 1.5)
          });

          const content = response.choices[0].message.content

          await sql` INSERT INTO creations (user_id, prompt, content, type)
          VALUES (${userId}, ${prompt}, ${content}, 'article')`;

          if(plan !== 'premium'){
               await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata:{
                         free_usage: free_usage + 1
                    }
               })
          }

          res.json({success: true, content})

     } catch (error) {
          console.log(error.message)
          res.json({success: false, message: error.message})
     }
}

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth()
    const { prompt } = req.body
    const plan = req.plan
    const free_usage = req.free_usage

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      })
    }

    // -------- 1. Extract keyword & category from frontend prompt --------
    const rawPrompt = prompt || ""

    const keywordMatch = rawPrompt.match(/keyword\s+(.*?)\s+in\s+the\s+category/i)
    const categoryMatch = rawPrompt.match(/category\s+(.*)$/i)

    const keyword = keywordMatch?.[1] || rawPrompt
    const category = categoryMatch?.[1] || "General"

    // -------- 2. Prompt Gemini (JSON preferred, fallback allowed) --------
    const aiPrompt = `
You may respond in JSON or plain text.

If JSON, use this schema:
{
  "titles": string[]
}

Generate blog titles for:
Keyword: "${keyword}"
Category: "${category}"

Rules:
- Prefer 5 titles
- Each title must be a complete sentence
- Avoid cutting sentences midway
- Titles should be descriptive and meaningful
`

    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful blog writer. Try to finish sentences completely.",
        },
        {
          role: "user",
          content: aiPrompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 500,
    })

    const raw = response?.choices?.[0]?.message?.content
    if (!raw) throw new Error("Empty AI response")

    // -------- 3. Robust extractor (JSON → fallback text) --------
    const extractTitles = (text) => {
      // Try JSON first
      try {
        const cleaned = text
          .replace(/```json|```/gi, "")
          .slice(text.indexOf("{"), text.lastIndexOf("}") + 1)

        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed.titles)) {
          return parsed.titles
        }
      } catch {
        // ignore JSON failure
      }

      // Fallback: split plain text
      return text
        .split(/\n+/)
        .map(line => line.replace(/^\d+\.\s*/, "").trim())
        .filter(line => line.length > 30)
    }

    let titles = extractTitles(raw)

    // -------- 4. Cleanup & normalization --------
    titles = titles
      .map(t => t.trim())
      .filter(t => t.length > 30)

    if (titles.length === 0) {
      console.error("RAW AI RESPONSE:", raw)
      throw new Error("AI did not generate usable titles")
    }

    // Limit to max 5 for UI
    titles = titles.slice(0, 5)

    // Convert to markdown text (frontend unchanged)
    const content = titles
      .map((t, i) => `${i + 1}. ${t.endsWith(".") ? t : t + "."}`)
      .join("\n")

    // -------- 5. Save to DB --------
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      })
    }

    res.json({ success: true, content })
  } catch (error) {
    console.error("BLOG TITLE ERROR:", error)
    res.json({
      success: false,
      message: error.message || "Generation failed",
    })
  }
}


export const generateImage = async (req, res)=>{
     try {
          const { userId } = req.auth();
          const { prompt, publish } = req.body;
          const plan = req.plan;

          if(plan !== 'premium'){
               return res.json({success: false, message: "This feature is only available for premium subscriptions."})
          }

          // ClipDrop API for image generation
          const formData = new FormData()
          formData.append('prompt', prompt)
          const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData,{
               headers: {'x-api-key': process.env.CLIPDROP_API_KEY,},
               responseType: "arraybuffer",
          })

          const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

          // cloudinary for storing the generated images on the cloud

          const {secure_url} = await cloudinary.uploader.upload(base64Image)

          await sql` INSERT INTO creations (user_id, prompt, content, type, publish)
          VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false })`;

          res.json({success: true,content: secure_url})

          } catch (error) {
               console.log(error.message)
               res.json({success: false, message: error.message})
          }
     }

export const removeImageBackground = async (req, res)=>{
     try {
          const { userId } = req.auth();
          const image = req.file;
          const plan = req.plan;

          if(plan !== 'premium'){
               return res.json({success: false, message: "This feature is only available for premium subscriptions."})
          }

         // remove the background of the image using cloudinary

          const {secure_url} = await cloudinary.uploader.upload(image.path, {
               transformation: [
                    {
                         effect: 'background_removal',
                         background_removal: 'remove_the_background'
                    }
               ]
          })

          await sql` INSERT INTO creations (user_id, prompt, content, type)
          VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

          res.json({success: true,content: secure_url})

          } catch (error) {
               console.log(error.message)
               res.json({success: false, message: error.message})
          }
     }

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth()
    const { object } = req.body
    const image = req.file
    const plan = req.plan

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      })
    }

    if (!image || !object) {
      return res.json({
        success: false,
        message: "Image and object are required",
      })
    }

    // ✅ CORRECTED: Using gen_remove instead of gen_replace
    const result = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: `gen_remove:prompt_(${object})`,
        },
      ],
      resource_type: "image",
    })

    const imageUrl = result.secure_url

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (
        ${userId},
        ${`Removed ${object} from image`},
        ${imageUrl},
        'image'
      )
    `

    res.json({ success: true, content: imageUrl })
  } catch (error) {
    console.error("REMOVE OBJECT ERROR:", error)
    res.json({
      success: false,
      message: error.message || "Failed to remove object",
    })
  }
}

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions."
      });
    }

    if (!resume || resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB)."
      });
    }

    // 1️⃣ Extract & clean resume text
    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const resumeTextRaw = pdfData.text;
    const resumeText = resumeTextRaw
    .replace(/\r/g, "")
    .trim()
    .slice(0, 3000); // ATS + Groq safe

    const atsResult = calculateATSScore(resumeTextRaw);

    // 2️⃣ Strong structured prompt
    const prompt = `
You are a senior technical recruiter reviewing a software engineering resume.

Analyze the resume below and provide a COMPLETE and DETAILED review.

Resume:
${resumeText}

MANDATORY RULES:
- Write ALL sections fully
- Each section must have at least 3-4 sentences
- Do NOT summarize briefly
- Do NOT stop early

Respond STRICTLY in this format:

1. Overall Summary
2. Key Strengths
3. Weaknesses and Gaps
4. Technical Skills Evaluation
5. Projects and Practical Experience
6. Resume Formatting and Clarity
7. Actionable Improvements
8. Final Verdict (Job Readiness)
`;

    // 3️⃣ Groq API call
    const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant", // ✅ FIXED
  messages: [
    { role: "user", content: prompt }
  ],
  temperature: 0.3,
  max_tokens: 1200
});

    const content = completion.choices[0].message.content;

    if (!content || content.length < 400) {
    finalContent = "Resume analysis could not be generated at this time. ATS score is shown below.";
    }

    // 4️⃣ Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId},'Review the uploaded resume',${content},'resume-review')`;

      res.json({ success: true, content,
      atsScore: atsResult.score,
      atsBreakdown: atsResult.breakdown
      });

  } catch (error) {
    console.error("GROQ RESUME ERROR:", error.message);

    res.json({
      success: false,
      message: "Resume review failed. Please try again later."
    });
  }
};






