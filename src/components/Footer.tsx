
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent">
                <div className="absolute inset-1 rounded-full bg-card flex items-center justify-center text-primary font-bold">
                  F
                </div>
              </div>
              <span className="font-bold text-xl">FAST-NUCES L&F</span>
            </Link>
            <p className="mt-4 text-muted-foreground">
              Connecting FAST-NUCES Islamabad students with their lost belongings through an 
              innovative digital platform.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://www.facebook.com/FASTNU.ISB/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com/fastnu_isb" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://www.instagram.com/fastnu_isb/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'Home', path: '/' },
                { name: 'Report Lost Item', path: '/report?type=lost' },
                { name: 'Report Found Item', path: '/report?type=found' },
                { name: 'Browse Lost Items', path: '/lost-items' },
                { name: 'Browse Found Items', path: '/found-items' },
                { name: 'Community Forum', path: '/community' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  FAST-NUCES, Block B, Faisal Town, Islamabad, Pakistan
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a 
                  href="mailto:helpdesk.isb@nu.edu.pk"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  helpdesk.isb@nu.edu.pk
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <a 
                  href="tel:+92-51-111-128-128"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  051-111-128-128
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Hours of Operation</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Monday - Friday</span>
                <span>9AM - 5PM</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Saturday</span>
                <span>9AM - 1PM</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Sunday</span>
                <span>Closed</span>
              </li>
            </ul>
            
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm">
                Need urgent assistance? Contact FAST-NUCES security at extension 555.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FAST-NUCES Lost & Found Portal. All rights reserved.
          </p>
          
          <p className="text-sm text-muted-foreground flex items-center">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> by FAST students
          </p>
          
          <div className="flex gap-4">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
