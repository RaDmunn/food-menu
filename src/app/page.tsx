import React from "react";
import Header from "@/components/main-page/Header";
import Hero from "@/components/main-page/Hero";
import FeaturesSection from "@/components/main-page/FeaturesSection";

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
