"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import SignInBtn from "@/components/SignInBtn";
import { useSession } from "@/lib/auth-client";

const Hero = () => {
  const { data: session } = useSession();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 sm:pt-28 sm:pb-20"
      style={{ backgroundColor: "#0B0A12" }}
    >
      {/* Ambient Glow Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-[20%] left-1/4 h-[400px] w-[600px] sm:h-[700px] sm:w-[1000px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-[300px] w-[500px] sm:h-[600px] sm:w-[900px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(192,38,211,0.18) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[600px]"
          style={{
            background: "radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Main layout — stacks on mobile, side-by-side on lg+ */}
      <div className="container relative z-10 mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Left Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center lg:text-left space-y-6 sm:space-y-8"
        >
          <motion.div variants={itemVariants} className="flex justify-center lg:justify-start">
            <Badge
              className="px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md text-xs sm:text-sm font-medium"
              style={{
                background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))",
                border: "1px solid rgba(168,85,247,0.35)",
                color: "#C084FC",
              }}
            >
              <Sparkles size={12} className="mr-1.5 sm:mr-2 animate-pulse" />
              AI-Engine v2.5 Now Live
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]"
            style={{ color: "#F8F7FA" }}
          >
            Diff to{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text-primary">Perfection.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto lg:mx-0 max-w-md text-base sm:text-lg md:text-xl font-medium leading-relaxed"
            style={{ color: "#8D8A9C" }}
          >
            Automate code reviews, fix CI failures, and ship with confidence.
            AI-powered development that doesn&apos;t just comment—it fixes.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2"
          >
            {session ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  className="btn-gradient-teal group flex items-center gap-2 rounded-full px-8 h-12 sm:h-14 text-sm sm:text-base"
                >
                  Open Dashboard
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                </Link>
              </motion.div>
            ) : (
              <SignInBtn />
            )}
          </motion.div>

          {/* Stat pills */}
          <motion.div
            variants={itemVariants}
            className="flex w-full flex-wrap justify-center lg:justify-start gap-2 pt-2"
          >
            {[
              { label: "Reviews automated", value: "10x faster" },
              { label: "CI diagnosis", value: "Instant" },
              { label: "Setup time", value: "2 min" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-sm"
                style={{
                  border: "1px solid rgba(168,85,247,0.2)",
                  backgroundColor: "rgba(168,85,247,0.06)",
                }}
              >
                <span className="text-xs font-bold text-[#F8F7FA]">{stat.value}</span>
                <span className="text-[11px]" style={{ color: "#8D8A9C" }}>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Content — Code Editor Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="relative flex items-center justify-center"
        >
          {/* 3D Blob — CSS gradient sphere */}
          <div
            className="absolute -right-8 -top-8 w-52 h-52 sm:w-72 sm:h-72 rounded-full opacity-70 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 35% 35%, #DB2777, #A855F7 50%, #6366F1 80%)",
              filter: "blur(40px)",
              transform: "scale(1.2)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute -right-4 -top-4 w-44 h-44 sm:w-60 sm:h-60 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, rgba(219,39,119,0.8) 30%, rgba(168,85,247,0.6) 60%, transparent 80%)",
              boxShadow: "inset -10px -10px 30px rgba(99,102,241,0.3), 0 0 40px rgba(192,38,211,0.4)",
            }}
            aria-hidden="true"
          />

          {/* Code visualization */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full max-w-sm sm:max-w-md lg:max-w-none rounded-2xl sm:rounded-3xl p-0.5 backdrop-blur-2xl overflow-hidden"
            style={{
              willChange: "transform",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "linear-gradient(135deg, rgba(20,18,32,0.8), rgba(14,13,22,0.9))",
              boxShadow: "0 0 60px rgba(168,85,247,0.15), 0 0 120px rgba(192,38,211,0.08)",
            }}
          >
            <div
              className="rounded-2xl sm:rounded-3xl overflow-hidden"
              style={{ backgroundColor: "#0D0B18" }}
            >
              {/* Title bar */}
              <div
                className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3"
                style={{
                  background: "linear-gradient(90deg, rgba(30,27,46,0.6), rgba(20,18,32,0.4))",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex gap-1.5">
                  {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                    <div
                      key={c}
                      className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span
                  className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: "#8D8A9C" }}
                >
                  Gemini 2.5 · D2P Review
                </span>
              </div>

              {/* Code body */}
              <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm space-y-2.5 sm:space-y-3">
                <div className="flex gap-3 sm:gap-4" style={{ color: "#4B4866" }}>
                  <span>1</span>
                  <span>
                    <span style={{ color: "#8B5CF6" }}>const</span> review ={" "}
                    <span style={{ color: "#22D3A6" }}>await</span>{" "}
                    <span style={{ color: "#F8F7FA" }}>D2P.analyze();</span>
                  </span>
                </div>
                <div
                  className="px-2.5 sm:px-3 py-1 rounded flex gap-3 sm:gap-4"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#F87171",
                  }}
                >
                  <span style={{ color: "#FCA5A5" }}>−</span>
                  <span>if (error) throw new Error()</span>
                </div>
                <div
                  className="px-2.5 sm:px-3 py-1 rounded flex gap-3 sm:gap-4"
                  style={{
                    backgroundColor: "rgba(34,211,166,0.08)",
                    border: "1px solid rgba(34,211,166,0.2)",
                    color: "#6EE7B7",
                  }}
                >
                  <span style={{ color: "#6EE7B7" }}>+</span>
                  <span>if (error) return fix()</span>
                </div>
                <div className="flex gap-3 sm:gap-4" style={{ color: "#4B4866" }}>
                  <span>4</span>
                  <span>
                    <span style={{ color: "#C084FC" }}>return</span>{" "}
                    <span style={{ color: "#F8F7FA" }}>review.apply();</span>
                  </span>
                </div>
              </div>

              {/* AI suggestion strip */}
              <div
                className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  background: "linear-gradient(90deg, rgba(139,92,246,0.12), rgba(192,38,211,0.08))",
                }}
              >
                <div className="flex items-center gap-2" style={{ color: "#C084FC" }}>
                  <Sparkles size={13} />
                  <span className="text-[10px] sm:text-xs font-semibold">AI Fix Ready — error handling optimized</span>
                </div>
                <button
                  className="rounded-md px-2.5 py-1 text-[10px] font-bold text-[#0B0A12] btn-gradient-teal"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>

          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-4 -right-2 sm:-bottom-8 sm:-right-8 hidden sm:block p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-xl shadow-2xl max-w-[180px] sm:max-w-[220px]"
            style={{
              willChange: "transform",
              border: "1px solid rgba(168,85,247,0.4)",
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))",
              boxShadow: "0 8px 40px rgba(168,85,247,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5" style={{ color: "#C084FC" }}>
              <Sparkles size={13} />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase">CI Fixed</span>
            </div>
            <p className="text-[10px] sm:text-xs leading-relaxed" style={{ color: "#8D8A9C" }}>
              Workflow failure diagnosed &amp; patch applied automatically.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
