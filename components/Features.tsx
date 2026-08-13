"use client";

import {
  Code2,
  GitPullRequest,
  Zap,
  Lock,
  Shield,
  Brain,
  RotateCcw,
  Sparkles,
  Flame,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Terminal,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

// Standard feature cards — updated to new palette
const featureCards = [
  {
    icon: <GitPullRequest size={22} style={{ color: "#A855F7" }} />,
    title: "AI-Powered Code Reviews",
    description:
      "Advanced AI analyzes pull requests instantly, detecting bugs, performance issues, security risks, and style improvements.",
    gradient: "rgba(168,85,247,0.12)",
    borderColor: "rgba(168,85,247,0.25)",
    iconBg: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(139,92,246,0.1))",
    hoverTextColor: "#C084FC",
  },
  {
    icon: <Code2 size={22} style={{ color: "#22D3A6" }} />,
    title: "One-Click Code Fixes",
    description:
      "Don't just get comments—get actionable diffs and patches you can review and apply with a single click.",
    gradient: "rgba(34,211,166,0.1)",
    borderColor: "rgba(34,211,166,0.22)",
    iconBg: "linear-gradient(135deg, rgba(34,211,166,0.2), rgba(34,211,166,0.08))",
    hoverTextColor: "#6EE7B7",
  },
  {
    icon: <Shield size={22} style={{ color: "#6366F1" }} />,
    title: "Security & Compliance",
    description:
      "Your code never leaves your environment. We analyze on-the-fly and discard immediately—no proprietary logic retained.",
    gradient: "rgba(99,102,241,0.12)",
    borderColor: "rgba(99,102,241,0.25)",
    iconBg: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.08))",
    hoverTextColor: "#A5B4FC",
  },
  {
    icon: <Brain size={22} style={{ color: "#EC4899" }} />,
    title: "Intelligent Context Learning",
    description:
      "D2P adapts to your codebase patterns over time, tailoring suggestions to match your unique coding standards.",
    gradient: "rgba(236,72,153,0.1)",
    borderColor: "rgba(236,72,153,0.22)",
    iconBg: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(219,39,119,0.08))",
    hoverTextColor: "#F9A8D4",
  },
  {
    icon: <RotateCcw size={22} style={{ color: "#22D3EE" }} />,
    title: "Seamless GitHub Integration",
    description:
      "Connect repos with one click. D2P listens to webhooks and monitors every PR without friction.",
    gradient: "rgba(34,211,238,0.1)",
    borderColor: "rgba(34,211,238,0.2)",
    iconBg: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.06))",
    hoverTextColor: "#67E8F9",
  },
  {
    icon: <Zap size={22} style={{ color: "#A3E635" }} />,
    title: "Retrigger & Continuous Review",
    description:
      "Re-analyze any PR or CI failure anytime with our retrigger functionality for continuous validation.",
    gradient: "rgba(163,230,53,0.08)",
    borderColor: "rgba(163,230,53,0.2)",
    iconBg: "linear-gradient(135deg, rgba(163,230,53,0.2), rgba(163,230,53,0.06))",
    hoverTextColor: "#BEF264",
  },
  {
    icon: <Lock size={22} style={{ color: "#F472B6" }} />,
    title: "Enterprise-Grade Security",
    description:
      "SOC 2 compliant infrastructure with end-to-end encryption. Built for teams that can't compromise on security.",
    gradient: "rgba(244,114,182,0.1)",
    borderColor: "rgba(244,114,182,0.22)",
    iconBg: "linear-gradient(135deg, rgba(244,114,182,0.2), rgba(219,39,119,0.08))",
    hoverTextColor: "#F9A8D4",
  },
  {
    icon: <Sparkles size={22} style={{ color: "#C084FC" }} />,
    title: "Agentic Workflow Automation",
    description:
      "Agentic AI doesn't just comment—it acts. Create branches, apply patches, and open PRs automatically.",
    gradient: "rgba(192,132,252,0.1)",
    borderColor: "rgba(192,132,252,0.22)",
    iconBg: "linear-gradient(135deg, rgba(192,132,252,0.2), rgba(168,85,247,0.08))",
    hoverTextColor: "#E879F9",
  },
];

// Simulated CI failure log entries
const logEntries = [
  { time: "09:14:02", level: "info", msg: "Running workflow: CI / build (push)" },
  { time: "09:14:05", level: "info", msg: "Installing dependencies…" },
  { time: "09:14:18", level: "error", msg: "TypeError: Cannot read properties of undefined (reading 'map')" },
  { time: "09:14:18", level: "error", msg: "at processRepos (/app/lib/repos.ts:47:23)" },
  { time: "09:14:19", level: "fatal", msg: "Process exited with code 1 — workflow failed" },
];

const levelColors: Record<string, string> = {
  info: "#8D8A9C",
  error: "#F87171",
  fatal: "#FB923C",
};

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      id="features"
      className="relative py-24 sm:py-32 overflow-hidden scroll-mt-20"
      style={{ backgroundColor: "#0E0D16" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, rgba(192,38,211,0.08) 50%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14 sm:mb-20"
        >
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 sm:mb-6 leading-tight"
            style={{ color: "#F8F7FA" }}
          >
            Powerful Features,
            <br />
            <span className="gradient-text-primary">Limitless Possibilities</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed" style={{ color: "#8D8A9C" }}>
            D2P combines AI-powered analysis with agentic automation to
            revolutionize your development workflow.
          </p>
        </motion.div>

        {/* ── FEATURED: CI/CD Failure Diagnosis ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-6 sm:mb-8 group relative overflow-hidden rounded-3xl backdrop-blur-xl"
          style={{
            border: "1px solid rgba(251,146,60,0.3)",
            background: "linear-gradient(135deg, rgba(234,88,12,0.12), rgba(14,13,22,0.85), rgba(11,10,18,0.9))",
          }}
        >
          {/* Hover border shine */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ border: "1px solid rgba(251,146,60,0.25)" }}
          />

          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left — copy */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              {/* Featured badge */}
              <div
                className="mb-5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  border: "1px solid rgba(251,146,60,0.3)",
                  backgroundColor: "rgba(251,146,60,0.1)",
                  color: "#FB923C",
                }}
              >
                <Flame size={13} />
                Featured Capability
              </div>

              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  border: "1px solid rgba(251,146,60,0.3)",
                  background: "linear-gradient(135deg, rgba(234,88,12,0.2), rgba(251,146,60,0.1))",
                }}
              >
                <Flame style={{ color: "#FB923C" }} size={22} />
              </div>

              <h3
                className="text-2xl sm:text-3xl font-black mb-3 group-hover:transition-colors"
                style={{ color: "#F8F7FA" }}
              >
                CI/CD Failure Diagnosis
              </h3>
              <p className="text-sm sm:text-base leading-relaxed mb-6 max-w-lg" style={{ color: "#8D8A9C" }}>
                D2P automatically detects GitHub Actions failures, parses raw logs with AI, pinpoints the root cause, and generates an intelligent patch—all without you lifting a finger.
              </p>

              {/* Capability pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Terminal size={12} />, label: "Log Analysis" },
                  { icon: <AlertTriangle size={12} />, label: "Root Cause AI" },
                  { icon: <GitBranch size={12} />, label: "Auto Branch" },
                  { icon: <CheckCircle2 size={12} />, label: "Patch & Fix" },
                ].map((pill) => (
                  <div
                    key={pill.label}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      border: "1px solid rgba(251,146,60,0.25)",
                      backgroundColor: "rgba(251,146,60,0.1)",
                      color: "#FBD38D",
                    }}
                  >
                    {pill.icon}
                    {pill.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — CI log visualization */}
            <div
              className="relative p-4 sm:p-6 lg:p-8 flex items-center justify-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-full max-w-md">
                {/* Terminal window */}
                <div
                  className="rounded-xl overflow-hidden shadow-2xl"
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "#0D0B18",
                  }}
                >
                  {/* Title bar */}
                  <div
                    className="flex items-center gap-2 px-4 py-2.5"
                    style={{
                      backgroundColor: "rgba(30,27,46,0.6)",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                    </div>
                    <span className="ml-2 text-[10px] font-mono" style={{ color: "#8D8A9C" }}>
                      github-actions · CI build · main
                    </span>
                    {/* Failure badge */}
                    <span
                      className="ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: "rgba(239,68,68,0.15)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#F87171",
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                      Failed
                    </span>
                  </div>

                  {/* Log stream */}
                  <div
                    className="p-4 font-mono text-[11px] sm:text-xs space-y-1.5"
                    style={{ backgroundColor: "#080612" }}
                  >
                    {logEntries.map((entry, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15, duration: 0.4 }}
                        className="flex gap-3"
                      >
                        <span style={{ color: "#4B4866" }}>{entry.time}</span>
                        <span
                          className="shrink-0 uppercase text-[9px] font-bold mt-px"
                          style={{ color: levelColors[entry.level] }}
                        >
                          [{entry.level}]
                        </span>
                        <span
                          style={{
                            color: entry.level !== "info" ? levelColors[entry.level] : "#8D8A9C",
                          }}
                        >
                          {entry.msg}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* AI diagnosis strip */}
                  <div
                    className="p-3 sm:p-4"
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      background: "linear-gradient(90deg, rgba(234,88,12,0.1), rgba(220,38,38,0.08))",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: "rgba(251,146,60,0.15)",
                          border: "1px solid rgba(251,146,60,0.3)",
                        }}
                      >
                        <Sparkles size={12} style={{ color: "#FB923C" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs font-semibold mb-1" style={{ color: "#FBD38D" }}>
                          AI Root Cause Identified
                        </p>
                        <p className="text-[10px] sm:text-[11px] leading-relaxed" style={{ color: "#8D8A9C" }}>
                          <span className="font-mono" style={{ color: "#F87171" }}>repos.ts:47</span> — accessing{" "}
                          <span className="font-mono" style={{ color: "#A3E635" }}>.map()</span> on undefined. Likely
                          missing null check after async fetch.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] sm:text-xs font-bold transition-all"
                        style={{
                          background: "linear-gradient(135deg, #22D3A6, #A3E635)",
                          color: "#0B0A12",
                        }}
                      >
                        <CheckCircle2 size={11} />
                        Apply AI Fix
                      </motion.button>
                      <button
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] sm:text-xs font-medium transition-all"
                        style={{
                          border: "1px solid rgba(255,255,255,0.08)",
                          backgroundColor: "rgba(255,255,255,0.04)",
                          color: "#8D8A9C",
                        }}
                      >
                        <Loader2 size={11} />
                        Re-diagnose
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Standard feature grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
        >
          {featureCards.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative p-5 sm:p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden cursor-pointer"
              style={{
                border: `1px solid ${feature.borderColor}`,
                backgroundColor: feature.gradient,
              }}
            >
              {/* Hover border shimmer */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, transparent, rgba(255,255,255,0.04), transparent)",
                }}
              />

              <div className="relative z-10 space-y-3 sm:space-y-4">
                {/* Icon */}
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-3"
                  style={{
                    background: feature.iconBg,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {feature.icon}
                </div>

                <h3
                  className="text-sm sm:text-base font-bold leading-snug transition-colors"
                  style={{ color: "#F8F7FA" }}
                >
                  {feature.title}
                </h3>

                <p
                  className="text-xs sm:text-sm leading-relaxed transition-colors"
                  style={{ color: "#8D8A9C" }}
                >
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
