import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-32">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-indigo-900/10 to-transparent blur-[80px]"></div>

      <div className="container relative z-10 mx-auto max-w-5xl rounded-3xl border border-white/10 bg-zinc-900/50 p-12 text-center shadow-2xl backdrop-blur-md sm:p-20">
        <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Ready to transform your{" "}
          <span className="text-blue-400">workflow?</span>
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300 sm:text-2xl leading-relaxed">
          Join visionary engineering teams already using D2P to merge with
          confidence and ship securely, faster.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="group h-14 gap-2 bg-white px-8 text-lg text-black hover:bg-gray-100 font-bold transition-all hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
            asChild
          >
            <Link href="/dashboard">
              Start Reviewing for Free
              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500 font-medium">
          No credit card required. Setup in 2 minutes.
        </p>
      </div>
    </section>
  );
};

export default CTA;
