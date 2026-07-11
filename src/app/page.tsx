import Hero from "@/components/Hero";
import HomeCategories from "@/components/HomeCategories";
import HowItWorks from "@/components/HowItWorks";
import FeaturedPros from "@/components/FeaturedPros";
import StatsBand from "@/components/StatsBand";
import WorkerCta from "@/components/WorkerCta";

export default function Home() {
  return (
    <>
      <Hero />
      <HomeCategories />
      <HowItWorks />
      <FeaturedPros />
      <StatsBand />
      <WorkerCta />
    </>
  );
}
