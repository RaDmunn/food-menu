import React from "react";
import Header from "@/components/main-page/Header";
import Hero from "@/components/main-page/Hero";
import FeaturesSection from "@/components/main-page/FeaturesSection";
import WhyChooseUs from "@/components/main-page/WhyChooseUs";


export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <WhyChooseUs
      leftImg="/img/kchau.png"
      rightImg="/img/shrek.png"
      />
      <FeaturesSection />
    </>
  );
}
