import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["Professional Beauty Studio", "Paris, France"],
    color: "text-primary"
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+33 1 23 45 67 89", "Available during business hours"],
    color: "text-accent-gold"
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["Am.beautyy2@gmail.com", "We'll respond within 24 hours"],
    color: "text-primary"
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Mon-Sat: 9:00 AM - 7:00 PM", "Sunday: By appointment only"],
    color: "text-accent-gold"
  }
];

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
            Get In Touch
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to book your appointment or have questions? We're here to help
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover-elevate transition-transform duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-background mb-4 ${info.color}`}>
                    <info.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className={idx === 0 ? "font-medium" : "text-sm text-muted-foreground"}>
                      {detail}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Card className="max-w-md mx-auto bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <Instagram className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Follow Us</h3>
              <p className="mb-4">Stay updated with our latest work</p>
              <a 
                href="https://instagram.com/am.beautyy2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block font-medium hover:underline"
                data-testid="link-instagram"
              >
                @Am.beautyy2
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}