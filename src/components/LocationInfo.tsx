
import { MapPin, Clock, Phone, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const LocationInfo = () => {
  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <span className="gradient-text">Pickup Locations</span> at FAST-NUCES
          </h2>
          <p className="text-muted-foreground">
            Found items can be picked up at these designated locations after verification.
            Our staff is ready to assist you during the specified hours.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{location.name}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{location.description}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{location.hours}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{location.contact}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// FAST-NUCES pickup locations for lost items
const locations = [
  {
    name: "CS Academic Office",
    description: "Located in A-Block, Ground Floor. Primary location for all CS department lost items.",
    hours: "Monday to Friday: 9:00 AM - 5:00 PM",
    contact: "051-111-128-128 (Ext. 102)"
  },
  {
    name: "Central Academic Office",
    description: "Located in Admin Block, First Floor. Handles valuable items and official documents.",
    hours: "Monday to Friday: 9:00 AM - 4:00 PM",
    contact: "051-111-128-128 (Ext. 111)"
  },
  {
    name: "One Stop Office",
    description: "Located at the university entrance. General lost & found items from common areas.",
    hours: "Monday to Friday: 8:30 AM - 5:30 PM, Saturday: 9:00 AM - 1:00 PM",
    contact: "051-111-128-128 (Ext. 100)"
  },
  {
    name: "Library Help Desk",
    description: "Located at the main library entrance. For items found within the library premises.",
    hours: "Monday to Friday: 8:00 AM - 9:00 PM, Saturday: 9:00 AM - 5:00 PM",
    contact: "051-111-128-128 (Ext. 120)"
  },
  {
    name: "Sports Complex Office",
    description: "Located at the entrance of Sports Complex. For items lost during sports activities.",
    hours: "Monday to Friday: 9:00 AM - 6:00 PM, Saturday: 10:00 AM - 4:00 PM",
    contact: "051-111-128-128 (Ext. 150)"
  },
  {
    name: "Campus Security Office",
    description: "Located near the main gate. Handles emergency lost & found items after hours.",
    hours: "24/7 Service",
    contact: "051-111-128-128 (Ext. 555)"
  }
];

export default LocationInfo;
