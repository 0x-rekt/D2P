import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "#0B0A12", color: "#F8F7FA" }}
    >
      <Hero />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default Home;
