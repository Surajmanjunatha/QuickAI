const TECH_KEYWORDS = [
  'javascript',
  'python',
  'java',
  'c++',
  'react',
  'node',
  'express',
  'mongodb',
  'mysql',
  'postgres',
  'html',
  'css',
  'git',
  'github',
  'docker',
  'aws',
  'api',
  'rest',
  'authentication',
  'jwt',
  'sql',
  'linux',
];

const ACTION_VERBS = [
  'built',
  'developed',
  'implemented',
  'designed',
  'created',
  'optimized',
  'led',
  'managed',
  'improved',
  'deployed',
  'integrated',
  'automated',
  'analyzed',
];

const SECTIONS = [
  'education',
  'skills',
  'projects',
  'experience',
  'internship',
  'certifications',
  'achievements',
];

export const calculateATSScore = (resumeText) => {
  const text = resumeText.toLowerCase();
  let score = 0;
  const breakdown = {};

  // 1️⃣ Skills (35)
  const skillMatches = TECH_KEYWORDS.filter((k) => text.includes(k));
  breakdown.skills = Math.min(35, skillMatches.length * 2);
  score += breakdown.skills;

  // 2️⃣ Sections (20)
  const sectionMatches = SECTIONS.filter((s) => text.includes(s));
  breakdown.sections = Math.min(20, sectionMatches.length * 3);
  score += breakdown.sections;

  // 3️⃣ Experience (15)
  const expIndicators = ['intern', 'experience', 'worked', 'company', 'role', 'years'];
  breakdown.experience = Math.min(15, expIndicators.filter((e) => text.includes(e)).length * 3);
  score += breakdown.experience;

  // 4️⃣ Action verbs (10)
  breakdown.actionVerbs = Math.min(10, ACTION_VERBS.filter((v) => text.includes(v)).length * 2);
  score += breakdown.actionVerbs;

  // 5️⃣ Formatting (10)
  const lines = resumeText.split('\n').length;
  breakdown.formatting = lines > 20 ? 10 : 5;
  score += breakdown.formatting;

  // 6️⃣ Contact info (10)
  const hasEmail = /\S+@\S+\.\S+/.test(resumeText);
  const hasPhone = /\d{10}/.test(resumeText);
  breakdown.contact = hasEmail && hasPhone ? 10 : hasEmail ? 5 : 0;
  score += breakdown.contact;

  return {
    score: Math.min(score, 100),
    breakdown,
  };
};
