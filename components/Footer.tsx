"use client";

import Link from "next/link";
import { Github, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "#0B0A12",
        borderTop: "1px solid rgba(168,85,247,0.08)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black gradient-text-primary">D2P</span>
          <span
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: "#22D3A6" }}
          />
          <span className="text-xs" style={{ color: "#4B4866" }}>
            {currentYear}
          </span>
        </div>

        {/* Center — tagline */}
        <p className="flex items-center gap-1.5 text-xs" style={{ color: "#4B4866" }}>
          Built with{" "}
          <Heart size={11} style={{ color: "#DB2777" }} />
          {" "}for developers
        </p>

        {/* Right — GitHub */}
        <a
          href="https://github.com/0x-rekt/d2p"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: "#4B4866" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#C084FC")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#4B4866")}
        >
          <Github size={13} />
          GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;
