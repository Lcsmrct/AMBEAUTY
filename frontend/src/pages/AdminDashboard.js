import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent, LoadingSpinner } from '../components/ui';
import { Calendar, Clock, LogOut, Settings, CheckCircle, XCircle, Clock as ClockIcon, Phone, Mail, TrendingUp, Plus, Trash2, Instagram } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { bookingAPI, timeSlotsAPI } from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '', service: 'Tous services' });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth');
      return;
    }
    fetchBookings();
    fetchTimeSlots();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAllBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réservations",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    setSlotsLoading(true);
    try {
      const response = await timeSlotsAPI.getAll();
      setTimeSlots(response.data);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les créneaux",
        variant: "error"
      });
    } finally {
      setSlotsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateStatus(bookingId, newStatus);
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      
      toast({
        title: "Statut mis à jour",
        description: `Réservation ${newStatus === 'confirmed' ? 'confirmée' : newStatus === 'cancelled' ? 'annulée' : 'complétée'}`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "error"
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Déconnexion", description: "À bientôt!" });
    navigate("/");
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.time) {
      toast({
        title: "Erreur",
        description: "Date et heure sont requis",
        variant: "error"
      });
      return;
    }

    try {
      await timeSlotsAPI.create(newSlot);
      setNewSlot({ date: '', time: '', service: 'Tous services' });
      fetchTimeSlots();
      toast({
        title: "Créneau créé",
        description: "Le nouveau créneau a été ajouté avec succès",
        variant: "success"
      });
    } catch (error) {
      console.error('Error creating time slot:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Impossible de créer le créneau",
        variant: "error"
      });
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return;
    
    try {
      await timeSlotsAPI.delete(slotId);
      fetchTimeSlots();
      toast({
        title: "Créneau supprimé",
        description: "Le créneau a été supprimé avec succès",
        variant: "success"
      });
    } catch (error) {
      console.error('Error deleting time slot:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le créneau",
        variant: "error"
      });
    }
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Administration AM.BEAUTYY2</h1>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Admin - {user.username}</span>
              <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                </div>
                <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Confirmés</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.confirmedBookings}</p>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Terminés</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.completedBookings}</p>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8">
            <TabsTrigger value="bookings" className="flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Gestion des </span>Réservations
            </TabsTrigger>
            <TabsTrigger value="slots" className="flex items-center gap-2 text-xs sm:text-sm">
              <Clock className="w-4 h-4" />
              Créneaux
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 text-xs sm:text-sm">
              <Settings className="w-4 h-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Toutes les Réservations</CardTitle>
                  <CardDescription>Gérez les rendez-vous de vos clients</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <Card key={booking.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="font-semibold text-lg">{booking.customer_name}</h3>
                                  {getStatusBadge(booking.status)}
                                </div>
                                
                                {/* Informations organisées par sections */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                  {/* Section Contact */}
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-primary mb-2">📧 Contact</h4>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                        <span className="break-all">{booking.customer_email}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-3 h-3 flex-shrink-0" />
                                        <span>{booking.customer_phone}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Instagram className="w-3 h-3 flex-shrink-0" />
                                        <span>
                                          {booking.user_instagram ? 
                                            `@${booking.user_instagram}` : 
                                            <span className="text-gray-400 italic">Non renseigné</span>
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Section Rendez-vous */}
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-primary mb-2">📅 Créneau</h4>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 flex-shrink-0" />
                                        <span>{new Date(booking.date).toLocaleDateString('fr-FR', { 
                                          weekday: 'long', 
                                          day: 'numeric', 
                                          month: 'long',
                                          year: 'numeric'
                                        })}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                        <span className="font-medium">{booking.time}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Section Service */}
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-primary mb-2">✨ Service</h4>
                                    <div className="space-y-1">
                                      <p className="font-medium text-foreground bg-primary/10 px-3 py-1 rounded-lg text-sm">
                                        {booking.service}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Notes */}
                                {booking.notes && (
                                  <div className="mt-4 p-3 bg-muted/30 rounded-lg border-l-2 border-l-accent-gold">
                                    <h4 className="font-medium text-sm text-primary mb-1">💬 Notes du client</h4>
                                    <p className="text-sm text-muted-foreground italic">
                                      "{booking.notes}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {booking.status === 'pending' && (
                              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                                <Button 
                                  size="sm" 
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  className="bg-green-600 hover:bg-green-700"
                                  data-testid={`button-confirm-${booking.id}`}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Confirmer
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  data-testid={`button-cancel-${booking.id}`}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Annuler
                                </Button>
                              </div>
                            )}
                            
                            {booking.status === 'confirmed' && (
                              <div className="mt-4 pt-4 border-t border-border">
                                <Button 
                                  size="sm" 
                                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                                  className="bg-blue-600 hover:blue-700"
                                  data-testid={`button-complete-${booking.id}`}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Marquer comme terminé
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      
                      {bookings.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Aucune réservation pour le moment</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="slots">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulaire de création de créneaux */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Ajouter un Créneau
                    </CardTitle>
                    <CardDescription>Créez de nouveaux créneaux disponibles pour les clients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateSlot} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <input
                          type="date"
                          value={newSlot.date}
                          onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Heure</label>
                        <input
                          type="time"
                          value={newSlot.time}
                          onChange={(e) => setNewSlot({...newSlot, time: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Type de créneau</label>
                        <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          Créneau universel - Valable pour tous les services
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ce créneau pourra être réservé pour n'importe quel service proposé
                        </p>
                      </div>
                      
                      <Button type="submit" className="w-full" data-testid="button-create-slot">
                        <Plus className="w-4 h-4 mr-2" />
                        Créer le Créneau
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Liste des créneaux existants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Créneaux Existants
                    </CardTitle>
                    <CardDescription>Gérez vos créneaux disponibles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {slotsLoading ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {timeSlots.map((slot) => (
                          <div 
                            key={slot.id} 
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              slot.is_booked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">
                                  {new Date(slot.date).toLocaleDateString('fr-FR')}
                                </span>
                                <Clock className="w-4 h-4 ml-2" />
                                <span>{slot.time}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <strong>
                                  {slot.service === 'Tous services' || slot.service === 'Tous les services' ? 
                                    'Créneau universel (tous services)' : slot.service}
                                </strong>
                                {slot.is_booked && (
                                  <Badge variant="error" className="ml-2">Réservé</Badge>
                                )}
                                {!slot.is_booked && slot.is_available && (
                                  <Badge variant="success" className="ml-2">Disponible</Badge>
                                )}
                              </div>
                            </div>
                            
                            {!slot.is_booked && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteSlot(slot.id)}
                                data-testid={`button-delete-slot-${slot.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        {timeSlots.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Aucun créneau créé pour le moment</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres</CardTitle>
                  <CardDescription>Configuration du système</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Paramètres à venir...</p>
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