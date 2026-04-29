"use client";

import Link from "next/link";
import { Github, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-black">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            D2P
          </span>
          <span className="h-1 w-1 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-600">
            © {currentYear}
          </span>
        </div>

        {/* Center — tagline */}
        <p className="flex items-center gap-1.5 text-xs text-gray-600">
          Built with <Heart size={11} className="text-red-500/70" /> for developers
        </p>

        {/* Right — GitHub */}
        <a
          href="https://github.com/0x-rekt/d2p"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors"
        >
          <Github size={13} />
          GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;
