"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, GitBranch, Zap, CheckCircle2 } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Connect Repository",
      description:
        "Log in securely with GitHub and select the repositories you want D2P to monitor. We set up webhooks instantly.",
      icon: GitBranch,
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
    },
    {
      number: 2,
      title: "AI Analyzes Code",
      description:
        "When a PR is opened, our AI triggers automatically, reviewing diffs for bugs, security issues, and improvements.",
      icon: Zap,
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-400",
    },
    {
      number: 3,
      title: "Get Fixes & Apply",
      description:
        "Review actionable suggestions and AI-generated code fixes. Apply patches with one click to a new branch.",
      icon: CheckCircle2,
      color: "from-emerald-500 to-emerald-600",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-400",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative border-t border-white/10 bg-gradient-to-b from-black via-zinc-950 to-black px-6 py-24 sm:py-32 overflow-hidden scroll-mt-20"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 right-1/4 h-96 w-[700px] rounded-full bg-purple-600/20 blur-[120px] opacity-100" />
      </div>

      <div className="container relative mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <h2 className="mb-4 sm:mb-6 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Simple workflow,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              powerful results
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg text-gray-400 leading-relaxed">
            Set up once, then let D2P work seamlessly in the background. A
            frictionless workflow that integrates directly into your GitHub
            process.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Connection Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
          >
            <motion.line
              x1="25%"
              y1="200"
              x2="50%"
              y2="200"
              stroke="url(#gradientLine1)"
              strokeWidth="2"
              strokeDasharray="1000"
              initial={{ strokeDashoffset: 1000 }}
              whileInView={{ strokeDashoffset: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.2 }}
            />
            <motion.line
              x1="50%"
              y1="200"
              x2="75%"
              y2="200"
              stroke="url(#gradientLine2)"
              strokeWidth="2"
              strokeDasharray="1000"
              initial={{ strokeDashoffset: 1000 }}
              whileInView={{ strokeDashoffset: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.4 }}
            />
            <defs>
              <linearGradient id="gradientLine1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="gradientLine2">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Step Cards */}
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2,
                  ease: "easeOut",
                }}
                className="group relative"
              >
                {/* Number Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    delay: index * 0.2 + 0.2,
                  }}
                  className={`mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} relative`}
                >
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/20" />
                  <div className={`text-5xl font-black ${step.textColor}`}>
                    {step.number}
                  </div>
                  <div className={`absolute inset-0 rounded-2xl border border-dashed ${step.borderColor}`} />
                </motion.div>

                {/* Card */}
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className={`relative text-center p-8 rounded-2xl border ${step.borderColor} bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-300`}
                >
                  {/* Icon */}
                  <div className={`mb-4 flex justify-center`}>
                    <Icon className={`${step.textColor} h-8 w-8`} />
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 leading-relaxed text-sm mb-4 group-hover:text-gray-300 transition-colors">
                    {step.description}
                  </p>

                  {/* Dividing Line */}
                  <div
                    className={`h-0.5 w-12 mx-auto bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                </motion.div>

                {/* Arrow Indicator (visible only on desktop) */}
                {index < steps.length - 1 && (
                  <div
                    className="hidden md:flex absolute top-1/3 -right-16 text-blue-400/40 group-hover:text-blue-400 transition-colors"
                  >
                    <ArrowRight size={24} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>


      </div>
    </section>
  );
};

export default HowItWorks;
