import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer
      className="
        w-full
        px-6
        sm:px-8
        md:px-16
        lg:px-24
        xl:px-32
        pt-16
        pb-12
        bg-gradient-to-br
        from-indigo-100
        via-indigo-50
        to-white
        text-gray-700
      "
    >
      <div
        className="
          flex
          flex-col
          lg:flex-row
          justify-between
          gap-14
          border-b
          border-indigo-200
          pb-12
        "
      >
        {/* Brand Section */}
        <div className="max-w-md">
          <img src={assets.logo} alt="QuickAI logo" className="h-11 mb-6" />

          <p className="text-sm leading-7 text-gray-600">
            QuickAI is an AI-powered platform designed to boost productivity by providing smart
            tools for content creation, analysis, and automation — faster, simpler, and smarter.
          </p>
        </div>

        {/* Links + Newsletter */}
        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-12
            sm:gap-16
            w-full
            lg:w-auto
          "
        >
          {/* Company Links */}
          <div>
            <h2 className="font-semibold mb-5 text-gray-900">QuickAI</h2>
            <ul className="space-y-3 text-sm">
              {['Home', 'About Us', 'Features', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase().replace(' ', '')}`}
                    className="
                      text-gray-600
                      hover:text-indigo-600
                      hover:translate-x-1
                      inline-block
                      transition-all
                      duration-200
                    "
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="max-w-sm w-full">
            <h2 className="font-semibold mb-5 text-gray-900">Subscribe to our newsletter</h2>
            <p className="text-sm text-gray-600 leading-6">
              Get AI tips, product updates, and exclusive features delivered straight to your inbox.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-5">
              <input
                type="email"
                placeholder="Enter your email"
                className="
                  w-full
                  h-11
                  px-3
                  rounded-lg
                  bg-white
                  border
                  border-gray-300
                  text-gray-800
                  placeholder-gray-400
                  focus:ring-2
                  focus:ring-indigo-400
                  outline-none
                "
              />
              <button
                className="
                  h-11
                  px-6
                  rounded-lg
                  bg-indigo-600
                  hover:bg-indigo-500
                  transition-all
                  duration-200
                  font-medium
                  text-white
                "
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <p className="pt-6 text-center text-xs sm:text-sm text-gray-500">
        © {new Date().getFullYear()} <span className="font-semibold text-gray-900">QuickAI</span>.
        All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
