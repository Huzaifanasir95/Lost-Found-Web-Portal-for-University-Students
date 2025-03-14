
import { 
  Search, 
  Bell, 
  Camera, 
  Shield, 
  MessageCircle,
  UserPlus,
  Check
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Camera className="h-10 w-10 text-primary" />,
      title: "Report Items",
      description: "Easily report lost or found items with descriptions and photos to help with identification."
    },
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Smart Search",
      description: "Use powerful filters to search by item type, location, date, and specific attributes."
    },
    {
      icon: <Bell className="h-10 w-10 text-primary" />,
      title: "Notifications",
      description: "Get instant alerts when items matching your description are found or claimed."
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Secure Verification",
      description: "Our verification process ensures items are returned to their rightful owners."
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-primary" />,
      title: "Community Help",
      description: "Connect with other students through our community forum to help find your items."
    },
    {
      icon: <UserPlus className="h-10 w-10 text-primary" />,
      title: "Anonymous Reporting",
      description: "Option to report found items anonymously while still helping others."
    }
  ];

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            <span className="gradient-text">Features Designed</span> for Students
          </h2>
          <p className="text-muted-foreground">
            Our platform offers a comprehensive set of tools to help university students 
            quickly recover their lost items or return found belongings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col items-start">
                <div className="p-3 rounded-lg bg-primary/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-card p-8 rounded-xl border border-border/50">
            <h3 className="text-2xl font-semibold mb-6 text-center">How It Works</h3>
            
            <div className="space-y-6">
              {[
                {
                  step: "Report your lost item or found belonging",
                  description: "Fill out a simple form with details and photos"
                },
                {
                  step: "Our system matches lost and found items",
                  description: "Smart algorithms help connect the right people"
                },
                {
                  step: "Verify ownership and arrange for pickup",
                  description: "Secure verification ensures items return to rightful owners"
                },
                {
                  step: "Mark the item as returned and complete",
                  description: "Close the loop and help us improve our service"
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.step}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
