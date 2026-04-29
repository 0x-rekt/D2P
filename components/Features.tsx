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

// Standard feature cards
const featureCards = [
  {
    icon: <GitPullRequest className="text-blue-400" size={22} />,
    title: "AI-Powered Code Reviews",
    description:
      "Advanced AI analyzes pull requests instantly, detecting bugs, performance issues, security risks, and style improvements.",
    gradient: "from-blue-600/20 to-blue-400/10",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/10",
  },
  {
    icon: <Code2 className="text-emerald-400" size={22} />,
    title: "One-Click Code Fixes",
    description:
      "Don't just get comments—get actionable diffs and patches you can review and apply with a single click.",
    gradient: "from-emerald-600/20 to-emerald-400/10",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/10",
  },
  {
    icon: <Shield className="text-indigo-400" size={22} />,
    title: "Security & Compliance",
    description:
      "Your code never leaves your environment. We analyze on-the-fly and discard immediately—no proprietary logic retained.",
    gradient: "from-indigo-600/20 to-indigo-400/10",
    border: "border-indigo-500/30",
    glow: "shadow-indigo-500/10",
  },
  {
    icon: <Brain className="text-purple-400" size={22} />,
    title: "Intelligent Context Learning",
    description:
      "D2P adapts to your codebase patterns over time, tailoring suggestions to match your unique coding standards.",
    gradient: "from-purple-600/20 to-purple-400/10",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/10",
  },
  {
    icon: <RotateCcw className="text-cyan-400" size={22} />,
    title: "Seamless GitHub Integration",
    description:
      "Connect repos with one click. D2P listens to webhooks and monitors every PR without friction.",
    gradient: "from-cyan-600/20 to-cyan-400/10",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/10",
  },
  {
    icon: <Zap className="text-yellow-400" size={22} />,
    title: "Retrigger & Continuous Review",
    description:
      "Re-analyze any PR or CI failure anytime with our retrigger functionality for continuous validation.",
    gradient: "from-yellow-600/20 to-yellow-400/10",
    border: "border-yellow-500/30",
    glow: "shadow-yellow-500/10",
  },
  {
    icon: <Lock className="text-rose-400" size={22} />,
    title: "Enterprise-Grade Security",
    description:
      "SOC 2 compliant infrastructure with end-to-end encryption. Built for teams that can't compromise on security.",
    gradient: "from-rose-600/20 to-rose-400/10",
    border: "border-rose-500/30",
    glow: "shadow-rose-500/10",
  },
  {
    icon: <Sparkles className="text-pink-400" size={22} />,
    title: "Agentic Workflow Automation",
    description:
      "Agentic AI doesn't just comment—it acts. Create branches, apply patches, and open PRs automatically.",
    gradient: "from-pink-600/20 to-pink-400/10",
    border: "border-pink-500/30",
    glow: "shadow-pink-500/10",
  },
];

// Simulated CI failure log entries for the featured card
const logEntries = [
  { time: "09:14:02", level: "info", msg: "Running workflow: CI / build (push)" },
  { time: "09:14:05", level: "info", msg: "Installing dependencies…" },
  { time: "09:14:18", level: "error", msg: "TypeError: Cannot read properties of undefined (reading 'map')" },
  { time: "09:14:18", level: "error", msg: "at processRepos (/app/lib/repos.ts:47:23)" },
  { time: "09:14:19", level: "fatal", msg: "Process exited with code 1 — workflow failed" },
];

const levelColors: Record<string, string> = {
  info: "text-gray-400",
  error: "text-red-400",
  fatal: "text-orange-400",
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
      className="relative bg-gradient-to-b from-black via-zinc-950 to-black py-24 sm:py-32 overflow-hidden scroll-mt-20"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-[150px]"
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
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 sm:mb-6 text-white leading-tight">
            Powerful Features,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Limitless Possibilities
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed">
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
          className="mb-6 sm:mb-8 group relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-600/15 via-zinc-950/80 to-black/80 backdrop-blur-xl"
        >
          {/* Hover border shine */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-r from-orange-400/20 via-transparent to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left — copy */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              {/* Featured badge */}
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-400">
                <Flame size={13} />
                Featured Capability
              </div>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-600/20 to-orange-400/10">
                <Flame className="text-orange-400" size={22} />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 group-hover:text-orange-300 transition-colors">
                CI/CD Failure Diagnosis
              </h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
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
                    className="flex items-center gap-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300"
                  >
                    {pill.icon}
                    {pill.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — CI log visualization */}
            <div className="relative border-t lg:border-t-0 lg:border-l border-white/[0.06] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Terminal window */}
                <div className="rounded-xl border border-white/10 bg-[#0a0e1f] overflow-hidden shadow-2xl shadow-black/50">
                  {/* Title bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/60 border-b border-white/[0.06]">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="ml-2 text-[10px] text-zinc-500 font-mono">github-actions · CI build · main</span>
                    {/* Failure badge */}
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                      Failed
                    </span>
                  </div>

                  {/* Log stream */}
                  <div className="p-4 font-mono text-[11px] sm:text-xs space-y-1.5 bg-[#060914]">
                    {logEntries.map((entry, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15, duration: 0.4 }}
                        className="flex gap-3"
                      >
                        <span className="shrink-0 text-zinc-600">{entry.time}</span>
                        <span className={`shrink-0 uppercase text-[9px] font-bold mt-px ${levelColors[entry.level]}`}>
                          [{entry.level}]
                        </span>
                        <span className={entry.level !== "info" ? levelColors[entry.level] : "text-zinc-400"}>
                          {entry.msg}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* AI diagnosis strip */}
                  <div className="border-t border-white/[0.06] bg-gradient-to-r from-orange-600/10 to-red-600/10 p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 border border-orange-500/30">
                        <Sparkles size={12} className="text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs font-semibold text-orange-300 mb-1">AI Root Cause Identified</p>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-relaxed">
                          <span className="text-red-400 font-mono">repos.ts:47</span> — accessing{" "}
                          <span className="text-yellow-400 font-mono">.map()</span> on undefined. Likely
                          missing null check after async fetch.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg shadow-orange-600/20"
                      >
                        <CheckCircle2 size={11} />
                        Apply AI Fix
                      </motion.button>
                      <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] sm:text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all">
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
              className={`group relative p-5 sm:p-6 rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} backdrop-blur-xl hover:shadow-xl ${feature.glow} transition-all duration-300 overflow-hidden cursor-pointer`}
            >
              {/* Hover border shimmer */}
              <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 space-y-3 sm:space-y-4">
                {/* Icon */}
                <motion.div
                  animate={{ rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-400/40 transition-all"
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                  {feature.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
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
