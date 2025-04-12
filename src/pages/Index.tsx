
import React from 'react';
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import LocationInfo from "@/components/LocationInfo";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />
        
        {/* How It Works Section */}
        <HowItWorks />
        
        {/* Features Section */}
        <Features />
        
        {/* Stats Section */}
        <Stats />
        
        {/* Testimonials Section */}
        <Testimonials />
        
        {/* Location Info Section */}
        <LocationInfo />
        
        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 animated-gradient-bg opacity-10 z-0"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to find what you've lost at FAST-NUCES?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join your fellow FAST students who have successfully recovered their belongings 
                through our platform. It's quick, easy, and completely free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="rounded-full" asChild>
                  <Link to="/report">
                    Get Started
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full" asChild>
                  <Link to="/lost-items">
                    Browse Lost Items
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
