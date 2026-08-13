"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section
      id="cta"
      className="relative overflow-hidden px-6 py-32 scroll-mt-20"
      style={{ backgroundColor: "#0E0D16" }}
    >
      {/* Animated Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-1/4 top-1/2 h-[600px] w-[900px] -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(ellipse, #7C3AED, rgba(124,58,237,0.4))",
            filter: "blur(140px)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 0.9, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -right-1/4 bottom-1/2 h-[600px] w-[900px] translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(ellipse, #C026D3, rgba(192,38,211,0.4))",
            filter: "blur(140px)",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl p-12 text-center shadow-2xl backdrop-blur-2xl overflow-hidden relative"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(135deg, rgba(20,18,32,0.7), rgba(14,13,22,0.8), rgba(11,10,18,0.9))",
            boxShadow: "0 0 80px rgba(168,85,247,0.08)",
          }}
        >
          {/* Gradient Border glow on hover */}
          <div
            className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.2), transparent, rgba(192,38,211,0.2))",
            }}
          />

          <div className="relative z-10 space-y-8">
            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-black tracking-tight leading-tight"
              style={{ color: "#F8F7FA" }}
            >
              Ready to{" "}
              <span className="gradient-text-primary">
                revolutionize your workflow?
              </span>
            </motion.h2>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mx-auto max-w-2xl text-lg md:text-xl leading-relaxed"
              style={{ color: "#8D8A9C" }}
            >
              Join engineering teams already using D2P to automate code reviews,
              fix CI failures, and ship with confidence. 10x faster, 100x more
              reliable.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  className="btn-gradient-teal group inline-flex items-center gap-2 rounded-full h-14 px-10 text-lg font-bold"
                >
                  Start Reviewing for Free
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center justify-center gap-4 text-xs pt-4"
              style={{ color: "#8D8A9C" }}
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} style={{ color: "#22D3A6" }} />
                99.9% Uptime SLA
              </div>
              <div className="h-4 w-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} style={{ color: "#22D3A6" }} />
                Enterprise Security
              </div>
              <div className="h-4 w-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} style={{ color: "#22D3A6" }} />
                24/7 Support
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
