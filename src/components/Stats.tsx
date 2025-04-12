
import { ArrowUpRight } from "lucide-react";

const Stats = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <span className="gradient-text">Helping FAST Students</span> Recover What Matters
          </h2>
          <p className="text-muted-foreground">
            Our platform has helped FAST-NUCES Islamabad students reconnect with their lost belongings,
            making campus life a little less stressful.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { stat: "500+", label: "Items Recovered" },
            { stat: "1,200+", label: "Registered Users" },
            { stat: "85%", label: "Recovery Rate" },
            { stat: "24h", label: "Avg. Recovery Time" }
          ].map((item, index) => (
            <div key={index} className="bg-card border border-border/50 rounded-xl p-6 text-center">
              <div className="relative mb-2 inline-block">
                <span className="text-4xl font-bold gradient-text">{item.stat}</span>
                <ArrowUpRight className="absolute -right-4 -top-2 h-5 w-5 text-green-500" />
              </div>
              <p className="text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-primary/5 rounded-xl p-8 border border-primary/20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                FAST-NUCES Success Stories
              </h3>
              <p className="text-muted-foreground mb-6">
                Since implementing our Lost & Found platform at FAST-NUCES Islamabad, we've seen:
              </p>
              <ul className="space-y-3">
                {[
                  "40% reduction in unclaimed lost items",
                  "65% decrease in time spent visiting multiple offices",
                  "Higher student satisfaction with campus services",
                  "More valuable items being returned to their owners"
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border border-border">
                <blockquote className="italic text-muted-foreground">
                  "The Lost & Found platform has transformed how we handle lost items on campus. 
                  Students love the easy reporting process, and our staff saves countless hours."
                </blockquote>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20"></div>
                  <div>
                    <p className="font-medium text-sm">Dr. M. Asif Khan</p>
                    <p className="text-xs text-muted-foreground">Campus Manager, FAST-NUCES</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/50 p-4 rounded-lg border border-border">
                <blockquote className="italic text-muted-foreground">
                  "I lost my laptop before a critical exam and was able to recover it within hours thanks 
                  to this platform. Can't imagine campus life without it now!"
                </blockquote>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-accent/20"></div>
                  <div>
                    <p className="font-medium text-sm">Hasan Ahmed</p>
                    <p className="text-xs text-muted-foreground">CS Student, Batch 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
