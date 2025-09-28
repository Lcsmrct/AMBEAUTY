import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Textarea, Select, SelectOption, Badge, Tabs, TabsList, TabsTrigger, TabsContent, LoadingSpinner } from '../components/ui';
import { Calendar, Clock, LogOut, Plus, CheckCircle, XCircle, Clock as ClockIcon, MessageSquare, User, Instagram } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { bookingAPI, timeSlotsAPI } from '../services/api';

const services = [
  "Pose américaine/Unie",
  "Pose en gel",
  "Vernis semi-permanent pieds/mains", 
  "Extension de cils"
];

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    service: "",
    date: "",
    time: "",
    notes: "",
    selectedSlotId: ""
  });
  const [bookings, setBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    instagram: user?.instagram || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBookings();
    fetchAvailableSlots();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos réservations",
        variant: "error"
      });
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await timeSlotsAPI.getAvailable();
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les créneaux disponibles",
        variant: "error"
      });
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Reset time when service or date changes to force reselection
      ...(field === 'service' || field === 'date' ? { time: '', selectedSlotId: '' } : {})
    }));
  };

  // Get available time slots for the selected date (les créneaux sont universels maintenant)
  const getAvailableTimesForSelectedServiceAndDate = () => {
    if (!formData.service || !formData.date) return [];
    
    return availableSlots.filter(slot => 
      slot.date === formData.date &&
      slot.is_available &&
      !slot.is_booked
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.selectedSlotId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un créneau disponible",
        variant: "error"
      });
      setLoading(false);
      return;
    }

    try {
      await bookingAPI.create({
        customer_name: user.username,
        customer_email: user.email,
        customer_phone: "+33 1 23 45 67 89", // This would be from user profile
        time_slot_id: formData.selectedSlotId,
        notes: formData.notes
      });
      
      toast({
        title: "Réservation envoyée!",
        description: "Nous vous contacterons bientôt pour confirmer votre rendez-vous.",
        variant: "success"
      });
      
      // Reset form and refresh data
      setFormData({ service: "", date: "", time: "", notes: "", selectedSlotId: "" });
      fetchBookings();
      fetchAvailableSlots();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Déconnexion", description: "À bientôt!" });
    navigate("/");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Confirmé</Badge>;
      case "pending":
        return <Badge variant="warning"><ClockIcon className="w-3 h-3 mr-1" />En attente</Badge>;
      case "completed":
        return <Badge variant="info"><CheckCircle className="w-3 h-3 mr-1" />Terminé</Badge>;
      case "cancelled":
        return <Badge variant="error"><XCircle className="w-3 h-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Espace Client</h1>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Bienvenue, {user.username}!</span>
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="book">
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
                      <Select 
                        value={formData.service} 
                        onChange={(e) => handleInputChange('service', e.target.value)}
                        data-testid="select-service"
                        required
                        disabled={loading || slotsLoading}
                      >
                        <SelectOption value="">Choisissez votre service</SelectOption>
                        {services.map((service) => (
                          <SelectOption key={service} value={service}>
                            {service}
                          </SelectOption>
                        ))}
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date souhaitée *
                        </Label>
                        <Select
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          data-testid="select-date"
                          required
                          disabled={loading || slotsLoading || !formData.service}
                        >
                          <SelectOption value="">
                            {!formData.service ? "Choisissez d'abord un service" : "Choisir une date"}
                          </SelectOption>
                          {formData.service && [...new Set(
                            availableSlots
                              .filter(slot => slot.is_available && !slot.is_booked)
                              .map(slot => slot.date)
                          )].map((date) => (
                            <SelectOption key={date} value={date}>
                              {new Date(date).toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                              })}
                            </SelectOption>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Créneau disponible *
                        </Label>
                        <Select 
                          value={formData.selectedSlotId} 
                          onChange={(e) => {
                            const selectedSlot = availableSlots.find(slot => slot.id === e.target.value);
                            setFormData(prev => ({ 
                              ...prev, 
                              selectedSlotId: e.target.value,
                              time: selectedSlot ? selectedSlot.time : ''
                            }));
                          }}
                          data-testid="select-time-slot"
                          required
                          disabled={loading || slotsLoading || !formData.service || !formData.date}
                        >
                          <SelectOption value="">
                            {!formData.service || !formData.date ? "Sélectionnez d'abord le service et la date" : "Choisir un créneau"}
                          </SelectOption>
                          {getAvailableTimesForSelectedServiceAndDate().map((slot) => (
                            <SelectOption key={slot.id} value={slot.id}>
                              {slot.time}
                            </SelectOption>
                          ))}
                        </Select>
                        {formData.service && formData.date && getAvailableTimesForSelectedServiceAndDate().length === 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            Aucun créneau disponible pour cette date. Essayez une autre date.
                          </p>
                        )}
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
                        disabled={loading}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full rounded-full text-lg py-6"
                      data-testid="button-submit-booking"
                      disabled={loading}
                    >
                      {loading ? "Réservation..." : "Réserver"}
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
                  {bookingsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}