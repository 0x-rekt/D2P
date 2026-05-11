"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#030303] via-[#0a0e27] to-[#030303] px-4 pt-24 pb-16 sm:pt-28 sm:pb-20">

      {/* Animated Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] left-1/4 h-[400px] w-[600px] sm:h-[600px] sm:w-[900px] rounded-full bg-gradient-to-b from-blue-600 to-indigo-600 blur-[120px] sm:blur-[140px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 h-[300px] w-[500px] sm:h-[500px] sm:w-[800px] rounded-full bg-gradient-to-t from-purple-600 to-pink-600 blur-[100px] sm:blur-[130px]"
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
            <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md hover:from-blue-500/30 hover:to-purple-500/30 transition-all text-xs sm:text-sm">
              <Sparkles size={12} className="mr-1.5 sm:mr-2 animate-pulse" />
              AI-Engine v2.5 Now Live
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.95]"
          >
            Diff to{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-500 bg-clip-text text-transparent animate-pulse">
              Perfection.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto lg:mx-0 max-w-md text-base sm:text-lg md:text-xl text-gray-300 font-medium leading-relaxed"
          >
            Automate code reviews, fix CI failures, and ship with confidence.
            AI-powered development that doesn&apos;t just comment—it fixes.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2"
          >
            {session ? (
              <Button
                size="lg"
                className="group rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 sm:px-8 h-12 sm:h-14 font-bold shadow-lg shadow-blue-600/40 transition-all hover:shadow-blue-400/60 hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                <Link href="/dashboard" className="flex items-center gap-2 text-white! no-underline hover:text-white!">
                  Open Dashboard
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                </Link>
              </Button>
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
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm"
              >
                <span className="text-xs font-bold text-white">{stat.value}</span>
                <span className="text-[11px] text-gray-500">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Content — full on lg, compact card on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="relative flex items-center justify-center"
        >
          {/* Code visualization — always visible, just scaled for mobile */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full max-w-sm sm:max-w-md lg:max-w-none rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-0.5 backdrop-blur-2xl shadow-[0_0_60px_rgba(59,130,246,0.15)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 blur-2xl" />

            <div className="relative rounded-[calc(1.5rem-2px)] sm:rounded-[calc(1.875rem-2px)] overflow-hidden bg-[#0a0e1f]">
              {/* Title bar */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-zinc-800/50 to-zinc-700/30 border-b border-white/5">
                <div className="flex gap-1.5">
                  {["bg-red-500", "bg-amber-500", "bg-emerald-500"].map((c) => (
                    <motion.div
                      key={c}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${c}`}
                    />
                  ))}
                </div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                  Gemini 2.5 · D2P Review
                </span>
              </div>

              {/* Code body */}
              <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm space-y-2.5 sm:space-y-3">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-zinc-500 flex gap-3 sm:gap-4"
                >
                  <span>1</span>
                  <span>
                    <span className="text-blue-400">const</span> review ={" "}
                    <span className="text-yellow-400">await</span> D2P.analyze();
                  </span>
                </motion.div>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-red-500/10 text-red-400 px-2.5 sm:px-3 py-1 rounded flex gap-3 sm:gap-4 border border-red-500/20"
                >
                  <span className="text-red-300">−</span>
                  <span>if (error) throw new Error()</span>
                </motion.div>
                <motion.div
                  animate={{ x: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                  className="bg-green-500/10 text-green-400 px-2.5 sm:px-3 py-1 rounded flex gap-3 sm:gap-4 border border-green-500/20"
                >
                  <span className="text-green-300">+</span>
                  <span>if (error) return fix()</span>
                </motion.div>
                <div className="text-zinc-500 flex gap-3 sm:gap-4">
                  <span>4</span>
                  <span>
                    <span className="text-purple-400">return</span> review.apply();
                  </span>
                </div>
              </div>

              {/* AI suggestion strip */}
              <div className="border-t border-white/5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-300">
                  <Sparkles size={13} />
                  <span className="text-[10px] sm:text-xs font-semibold">AI Fix Ready — error handling optimized</span>
                </div>
                <button className="rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-blue-500 transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </motion.div>

          {/* Floating badge — only on sm+ so it doesn't overlap on tiny screens */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-4 -right-2 sm:-bottom-8 sm:-right-8 hidden sm:block p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-600/20 to-blue-600/10 backdrop-blur-xl shadow-2xl shadow-blue-600/20 max-w-[180px] sm:max-w-[220px]"
          >
            <div className="flex items-center gap-2 text-blue-300 mb-1.5">
              <Sparkles size={13} />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase">CI Fixed</span>
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-300 leading-relaxed">
              Workflow failure diagnosed & patch applied automatically.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
