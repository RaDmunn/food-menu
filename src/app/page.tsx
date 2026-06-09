import React from "react";
import Header from "@/components/main-page/Header";
import Hero from "@/components/main-page/Hero";
import FeaturesSection from "@/components/main-page/FeaturesSection";
import WhyChooseUs from "@/components/main-page/WhyChooseUs";
import Footer from "@/components/main-page/Footer";


export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <WhyChooseUs
      leftImg="/img/menu-simple.png"
      rightImg="/img/menu-online.png"
      />
      <FeaturesSection />
      <Footer />
    </>
  );
}
