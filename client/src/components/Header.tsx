import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="text-2xl font-bold text-primary"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            AM.BEAUTYY2
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {["Services", "Gallery", "Contact"].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-foreground hover:text-primary transition-colors"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                whileHover={{ y: -2 }}
                data-testid={`link-${item.toLowerCase().replace(" ", "-")}`}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <motion.div 
            className="hidden md:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button 
              className="rounded-full bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = "/auth"}
              data-testid="button-book-appointment"
            >
              Se connecter
            </Button>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav 
            className="md:hidden mt-4 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {["Services", "Gallery", "Contact"].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="block py-2 text-foreground hover:text-primary transition-colors"
                whileHover={{ x: 10 }}
                onClick={() => setIsMenuOpen(false)}
                data-testid={`link-mobile-${item.toLowerCase().replace(" ", "-")}`}
              >
                {item}
              </motion.a>
            ))}
            <Button 
              className="w-full mt-4 rounded-full bg-primary"
              onClick={() => window.location.href = "/auth"}
              data-testid="button-mobile-book"
            >
              Se connecter
            </Button>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}