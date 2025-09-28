import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent, LoadingSpinner } from '../components/ui';
import { Calendar, Clock, LogOut, Settings, CheckCircle, XCircle, Clock as ClockIcon, Phone, Mail, TrendingUp, Plus, Trash2 } from 'lucide-react';
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
  const [newSlot, setNewSlot] = useState({ date: '', time: '', service: 'Manucure' });

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
    if (!newSlot.date || !newSlot.time || !newSlot.service) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "error"
      });
      return;
    }

    try {
      await timeSlotsAPI.create(newSlot);
      setNewSlot({ date: '', time: '', service: 'Manucure' });
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

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                </div>
                <ClockIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmés</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Terminés</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completedBookings}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Gestion des Réservations
            </TabsTrigger>
            <TabsTrigger value="slots" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Créneaux
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
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
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-lg">{booking.customer_name}</h3>
                                  {getStatusBadge(booking.status)}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-3 h-3" />
                                      {booking.customer_email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-3 h-3" />
                                      {booking.customer_phone}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(booking.date).toLocaleDateString('fr-FR')}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3" />
                                      {booking.time}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-3">
                                  <p className="font-medium text-primary">{booking.service}</p>
                                  {booking.notes && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      <strong>Notes:</strong> {booking.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {booking.status === 'pending' && (
                              <div className="flex gap-2">
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
                              <Button 
                                size="sm" 
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid={`button-complete-${booking.id}`}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Marquer comme terminé
                              </Button>
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