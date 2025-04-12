
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const Testimonials = () => {
  return (
    <section className="py-16 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <span className="gradient-text">Student Experiences</span>
          </h2>
          <p className="text-muted-foreground">
            Hear from FAST-NUCES students who have successfully reconnected with their lost belongings through our platform.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar>
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    <AvatarImage src={testimonial.avatar} />
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.program}</p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">{testimonial.quote}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Mock testimonials with FAST-NUCES student profiles
const testimonials = [
  {
    name: "Ahmed Khan",
    program: "CS Student, Batch '24",
    quote: "I lost my calculator before a critical exam in A-Block. Posted it on FindersNexus and someone found it in the CS lab within hours!",
    avatar: ""
  },
  {
    name: "Fatima Ali",
    program: "BS Electrical Engineering",
    quote: "Found someone's ID card in the cafeteria and used the platform to return it. The verification system made sure it went to the right person.",
    avatar: ""
  },
  {
    name: "Saad Mahmood",
    program: "Business Administration",
    quote: "The notification system is amazing! Got an alert as soon as someone found my lost notebook with all my Management course notes.",
    avatar: ""
  },
  {
    name: "Ayesha Tariq",
    program: "Computer Science",
    quote: "Left my laptop charger in the library during finals week and was panicking. Posted on the community forum and had it back within an hour!",
    avatar: ""
  },
  {
    name: "Omar Farooq",
    program: "BS AI",
    quote: "As a freshman, I was constantly losing things on campus. This platform helped me find my lost USB drive with all my programming assignments.",
    avatar: ""
  },
  {
    name: "Zainab Imran",
    program: "Software Engineering",
    quote: "The anonymous reporting feature is fantastic. I was able to return someone's wallet without the awkwardness of direct contact.",
    avatar: ""
  }
];

export default Testimonials;
