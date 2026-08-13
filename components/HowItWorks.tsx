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
      gradientFrom: "#7C3AED",
      gradientTo: "#A855F7",
      borderColor: "rgba(168,85,247,0.3)",
      textColor: "#C084FC",
      iconBg: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(168,85,247,0.1))",
      numberGrad: "linear-gradient(135deg, #7C3AED, #A855F7)",
    },
    {
      number: 2,
      title: "AI Analyzes Code",
      description:
        "When a PR is opened, our AI triggers automatically, reviewing diffs for bugs, security issues, and improvements.",
      icon: Zap,
      gradientFrom: "#EC4899",
      gradientTo: "#F472B6",
      borderColor: "rgba(236,72,153,0.3)",
      textColor: "#F9A8D4",
      iconBg: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(244,114,182,0.08))",
      numberGrad: "linear-gradient(135deg, #DB2777, #F472B6)",
    },
    {
      number: 3,
      title: "Get Fixes & Apply",
      description:
        "Review actionable suggestions and AI-generated code fixes. Apply patches with one click to a new branch.",
      icon: CheckCircle2,
      gradientFrom: "#22D3A6",
      gradientTo: "#A3E635",
      borderColor: "rgba(34,211,166,0.3)",
      textColor: "#6EE7B7",
      iconBg: "linear-gradient(135deg, rgba(34,211,166,0.2), rgba(163,230,53,0.08))",
      numberGrad: "linear-gradient(135deg, #22D3A6, #A3E635)",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative px-6 py-24 sm:py-32 overflow-hidden scroll-mt-20"
      style={{
        backgroundColor: "#0B0A12",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 right-1/4 h-96 w-[700px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(192,38,211,0.15) 0%, rgba(124,58,237,0.1) 40%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
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
          <h2
            className="mb-4 sm:mb-6 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight"
            style={{ color: "#F8F7FA" }}
          >
            Simple workflow,{" "}
            <span className="gradient-text-primary">powerful results</span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed" style={{ color: "#8D8A9C" }}>
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
              x1="25%" y1="200" x2="50%" y2="200"
              stroke="url(#gradientLine1)"
              strokeWidth="2"
              strokeDasharray="1000"
              initial={{ strokeDashoffset: 1000 }}
              whileInView={{ strokeDashoffset: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.2 }}
            />
            <motion.line
              x1="50%" y1="200" x2="75%" y2="200"
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
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <linearGradient id="gradientLine2">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#22D3A6" />
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
                transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
                className="group relative"
              >
                {/* Number Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 100, delay: index * 0.2 + 0.2 }}
                  className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-2xl relative"
                  style={{ background: step.numberGrad }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ border: "2px solid rgba(255,255,255,0.2)" }}
                  />
                  <div
                    className="text-5xl font-black"
                    style={{ color: "#F8F7FA", opacity: 0.9 }}
                  >
                    {step.number}
                  </div>
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ border: "1px dashed rgba(255,255,255,0.3)" }}
                  />
                </motion.div>

                {/* Card */}
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="relative text-center p-8 rounded-2xl backdrop-blur-xl transition-all duration-300"
                  style={{
                    border: `1px solid ${step.borderColor}`,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                  }}
                >
                  {/* Icon */}
                  <div className="mb-4 flex justify-center">
                    <Icon className="h-8 w-8" style={{ color: step.textColor }} />
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-3 text-2xl font-bold transition-colors"
                    style={{ color: "#F8F7FA" }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="leading-relaxed text-sm mb-4 transition-colors"
                    style={{ color: "#8D8A9C" }}
                  >
                    {step.description}
                  </p>

                  {/* Dividing Line */}
                  <div
                    className="h-0.5 w-12 mx-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: step.numberGrad }}
                  />
                </motion.div>

                {/* Arrow Indicator */}
                {index < steps.length - 1 && (
                  <div
                    className="hidden md:flex absolute top-1/3 -right-16 transition-colors"
                    style={{ color: "rgba(168,85,247,0.4)" }}
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
