import React from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <FeaturesSection />
      <Hero />
    </>
  );
}
