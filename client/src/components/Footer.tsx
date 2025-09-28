import { motion } from "framer-motion";
import { Sparkles, Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div 
            className="col-span-1 md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">
                <span className="font-serif">AM.</span>
                <span className="text-primary">BEAUTYY2</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Professional beauty services specializing in manicures and eyelash extensions. 
              Enhancing your natural beauty with precision and care.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/am.beautyy2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                data-testid="link-footer-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#services" className="hover:text-primary transition-colors">Manicure</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">French Manicure</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Semi-Permanent Polish</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Eyelash Extensions</a></li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Am.beautyy2@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                <span>@Am.beautyy2</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="border-t mt-12 pt-8 text-center text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p>&copy; {currentYear} AM.BEAUTYY2. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}