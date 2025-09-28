import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, LogOut, Plus, CheckCircle, XCircle, Clock as ClockIcon, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const services = [
  "Manicure - Pose américaine/Unie (25€)",
  "Manicure - Pose américaine/French/Chargée (30€)", 
  "Vernis semi-permanent pieds/mains (20€)",
  "Extension de cils (30€)"
];

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

// Mock bookings data
const mockBookings = [
  {
    id: 1,
    service: "Extension de cils (30€)",
    date: "2024-01-15",
    time: "14:00",
    status: "confirmed",
    notes: "Première fois, lashes naturelles"
  },
  {
    id: 2,
    service: "Manicure - Pose américaine/French/Chargée (30€)",
    date: "2024-01-20",
    time: "16:00",
    status: "pending",
    notes: "French classique"
  },
  {
    id: 3,
    service: "Vernis semi-permanent pieds/mains (20€)",
    date: "2024-01-08",
    time: "10:00",
    status: "completed",
    notes: ""
  }
];

export default function ClientDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    service: "",
    date: "",
    time: "",
    notes: ""
  });
  const [bookings, setBookings] = useState(mockBookings);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking = {
      id: bookings.length + 1,
      service: formData.service,
      date: formData.date,
      time: formData.time,
      status: "pending" as const,
      notes: formData.notes
    };
    
    setBookings(prev => [newBooking, ...prev]);
    console.log('New booking:', newBooking);
    toast({
      title: "Réservation envoyée!",
      description: "Nous vous contacterons bientôt pour confirmer votre rendez-vous.",
    });
    
    // Reset form
    setFormData({ service: "", date: "", time: "", notes: "" });
  };

  const logout = () => {
    toast({ title: "Déconnexion", description: "À bientôt!" });
    setTimeout(() => navigate("/"), 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmé</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><ClockIcon className="w-3 h-3 mr-1" />En attente</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Terminé</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Espace Client</h1>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Bienvenue!</span>
              <Button variant="outline" onClick={logout} data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="book" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="book" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Rendez-vous
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Mes Rendez-vous
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Réserver un Rendez-vous</CardTitle>
                  <CardDescription>Choisissez votre service et votre créneau préféré</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Service *
                      </Label>
                      <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
                        <SelectTrigger data-testid="select-service">
                          <SelectValue placeholder="Choisissez votre service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date souhaitée *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                          data-testid="input-date"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Heure souhaitée *
                        </Label>
                        <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)}>
                          <SelectTrigger data-testid="select-time">
                            <SelectValue placeholder="Choisir l'heure" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Notes supplémentaires
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Demandes spéciales, préférences..."
                        rows={3}
                        data-testid="textarea-notes"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full rounded-full bg-primary hover:bg-primary/90 text-lg py-6"
                      data-testid="button-submit-booking"
                    >
                      Réserver
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="bookings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Mes Rendez-vous</CardTitle>
                  <CardDescription>Historique et rendez-vous à venir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{booking.service}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(booking.date).toLocaleDateString('fr-FR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {booking.time}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                          {booking.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Notes:</strong> {booking.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    {bookings.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun rendez-vous pour le moment</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}