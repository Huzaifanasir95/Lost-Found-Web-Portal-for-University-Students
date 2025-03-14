
import { Check, FileSearch, Bell, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const HowItWorks = () => {
  return (
    <section className="py-16 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 animated-gradient-bg opacity-5 z-0" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">
            How <span className="gradient-text">FindersNexus</span> Works
          </h2>
          <p className="text-muted-foreground">
            Our platform makes it easy for FAST-NUCES Islamabad students to report, find, and claim lost items
            without the hassle of visiting multiple offices.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">Step {index + 1}</h3>
                <h4 className="font-medium mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="h-0.5 w-6 bg-border" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            <span>Secure & Reliable</span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground ml-4">
            <Check className="h-4 w-4 text-green-500" />
            <span>Fast Recovery</span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground ml-4">
            <Check className="h-4 w-4 text-green-500" />
            <span>Privacy Protected</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const steps = [
  {
    title: "Report",
    description: "Submit details of lost items or report items you've found on campus, with photos and description.",
    icon: <FileSearch className="h-6 w-6 text-primary" />
  },
  {
    title: "Search",
    description: "Browse through listings of lost and found items categorized by locations like A-Block, B-Block, or Cafeteria.",
    icon: <FileSearch className="h-6 w-6 text-primary" />
  },
  {
    title: "Get Notified",
    description: "Receive instant alerts when a matching item is found or when someone claims your found item.",
    icon: <Bell className="h-6 w-6 text-primary" />
  },
  {
    title: "Claim Securely",
    description: "Verify ownership through our secure system and arrange pickup from the relevant office.",
    icon: <Shield className="h-6 w-6 text-primary" />
  }
];

export default HowItWorks;
