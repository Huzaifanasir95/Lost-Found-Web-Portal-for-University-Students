
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, FileSymlink, Shield } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Abstract shape decorations */}
      <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-[5%] w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-12 sm:py-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="gradient-text">Lost something</span>
              <br />
              at FAST-NUCES?
            </h1>
            <p className="text-lg mb-8 text-muted-foreground max-w-xl mx-auto lg:mx-0">
              A digital platform where FAST-NUCES Islamabad students can report lost items, 
              find recovered belongings, and reconnect with their possessions without visiting multiple offices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/report">
                  <FileSymlink className="mr-2 h-5 w-5" />
                  Report an Item
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/lost-items">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Lost Items
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md">
            <div className="relative">
              {/* Base card with shadow */}
              <div className="glass-card p-6 border-2 border-primary/20">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Recently Found</h3>
                    <div className="bg-green-500/20 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                      New
                    </div>
                  </div>
                  
                  {[
                    {
                      title: "Student ID Card",
                      location: "Found at Library",
                      time: "2 hours ago",
                      icon: <Shield size={20} />
                    },
                    {
                      title: "Calculator (FX-991ES)",
                      location: "Found at A-Block",
                      time: "1 day ago",
                      icon: <FileSymlink size={20} />
                    },
                    {
                      title: "Water Bottle",
                      location: "Found at Cafeteria",
                      time: "3 days ago",
                      icon: <Search size={20} />
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.location} • {item.time}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/found-items">View All Found Items</Link>
                  </Button>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/10 rounded-full" />
              <div className="absolute -top-3 -left-3 w-16 h-16 bg-primary/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
