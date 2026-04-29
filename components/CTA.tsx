"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black px-6 py-32 scroll-mt-20"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-1/4 top-1/2 h-[600px] w-[900px] -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1, 0.9, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -right-1/4 bottom-1/2 h-[600px] w-[900px] translate-y-1/2 rounded-full bg-gradient-to-l from-purple-600 to-purple-400 blur-[150px]"
        />
      </div>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 mix-blend-overlay"></div>

      <div className="container relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/60 via-zinc-950/60 to-black/80 p-12 text-center shadow-2xl shadow-blue-600/10 backdrop-blur-2xl overflow-hidden relative"
        >
          {/* Gradient Border Animation */}
          <div className="absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-r from-blue-600 via-transparent to-purple-600 opacity-0 hover:opacity-20 transition-opacity duration-500" />

          <div className="relative z-10 space-y-8">
            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight"
            >
              Ready to{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
                revolutionize your workflow?
              </span>
            </motion.h2>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mx-auto max-w-2xl text-lg md:text-xl text-gray-300 leading-relaxed"
            >
              Join engineering teams already using D2P to automate code reviews,
              fix CI failures, and ship with confidence. 10x faster, 100x more
              reliable.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
            >
              <Button
                size="lg"
                className="group h-14 gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-8 text-lg text-white font-bold transition-all hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-105 active:scale-95"
                asChild
              >
                <Link href="/dashboard" className="text-white! hover:text-white! flex items-center gap-2">
                  Start Reviewing for Free
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-4"
            >
              <div className="flex items-center gap-1">
                <span className="text-green-400">✓</span> 99.9% Uptime SLA
              </div>
              <div className="h-4 w-px bg-white/10"></div>
              <div className="flex items-center gap-1">
                <span className="text-green-400">✓</span> Enterprise Security
              </div>
              <div className="h-4 w-px bg-white/10"></div>
              <div className="flex items-center gap-1">
                <span className="text-green-400">✓</span> 24/7 Support
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
