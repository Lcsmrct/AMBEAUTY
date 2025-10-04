import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Award, Plus, X, Calendar, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, CardContent, Textarea, Label, Select, SelectOption, Modal } from './ui';
import { useToast } from '../hooks/useToast';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total_reviews: 0, average_rating: 0, rating_distribution: {} });
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    booking_id: '',
    rating: 5,
    comment: ''
  });
  
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    loadReviewsAndStats();
    if (isAuthenticated) {
      loadEligibleBookings();
    }
  }, [isAuthenticated]);

  const loadReviewsAndStats = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        reviewsAPI.getApproved(),
        reviewsAPI.getStats()
      ]);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      addToast('Erreur lors du chargement des avis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleBookings = async () => {
    try {
      const response = await reviewsAPI.getEligibleBookings();
      setEligibleBookings(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.booking_id || !reviewForm.comment.trim()) {
      addToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsAPI.create(reviewForm);
      addToast('Votre avis a été envoyé ! Il sera visible après validation.', 'success');
      setShowAddReviewModal(false);
      setReviewForm({ booking_id: '', rating: 5, comment: '' });
      loadEligibleBookings(); // Reload to update has_review status
    } catch (error) {
      addToast(error.response?.data?.detail || 'Erreur lors de l\'envoi de l\'avis', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, size = 'w-4 h-4') => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i}
        className={`${size} ${i < rating ? 'fill-pink-400 text-pink-400' : 'text-gray-300'}`}
      />
    ));
  };

  const renderRatingDistribution = () => {
    if (!stats.total_reviews) return null;
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = stats.rating_distribution[rating] || 0;
          const percentage = (count / stats.total_reviews) * 100;
          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 min-w-[60px]">
                <span className="text-sm">{rating}</span>
                <Star className="w-3 h-3 fill-pink-400 text-pink-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-pink-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground min-w-[30px]">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const canAddReview = eligibleBookings.some(booking => !booking.has_review);

  return (
    <section id="avis" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
            Avis Clients
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez les témoignages de nos clientes satisfaites
          </p>
        </motion.div>

        {/* Statistiques des avis */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="text-center p-6" data-testid="review-stats-average">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-6 h-6 text-pink-400" />
              <span className="text-3xl font-bold">{stats.average_rating}</span>
              <span className="text-muted-foreground">/5</span>
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(stats.average_rating), 'w-5 h-5')}
            </div>
            <p className="text-muted-foreground">Note moyenne</p>
          </Card>

          <Card className="text-center p-6" data-testid="review-stats-total">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquare className="w-6 h-6 text-pink-400" />
              <span className="text-3xl font-bold">{stats.total_reviews}</span>
            </div>
            <p className="text-muted-foreground">Avis clients</p>
          </Card>

          <Card className="p-6" data-testid="review-stats-distribution">
            <h4 className="font-semibold mb-4 text-center">Répartition des notes</h4>
            {renderRatingDistribution()}
          </Card>
        </motion.div>

        {/* Bouton d'ajout d'avis pour les utilisateurs connectés */}
        {isAuthenticated && canAddReview && (
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Button 
              onClick={() => setShowAddReviewModal(true)}
              className="rounded-full"
              data-testid="button-add-review"
            >
              <Plus className="w-4 h-4 mr-2" />
              Laisser un avis
            </Button>
          </motion.div>
        )}

        {/* Affichage des avis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4" />
                <div className="h-16 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </Card>
            ))
          ) : reviews.length > 0 ? (
            reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover-elevate" data-testid={`review-card-${review.id}`}>
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-pink-600">
                            {review.customer_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{review.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{review.service}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3 line-clamp-4">
                      {review.comment}
                    </p>
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.approved_at || review.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="col-span-full flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-card rounded-lg p-12 shadow-lg text-center max-w-md mx-auto">
                <MessageSquare className="w-16 h-16 text-pink-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Aucun avis pour le moment
                </h3>
                <p className="text-muted-foreground mb-6">
                  Soyez la première à partager votre expérience !
                </p>
                {isAuthenticated && canAddReview && (
                  <Button 
                    onClick={() => setShowAddReviewModal(true)}
                    className="rounded-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Laisser le premier avis
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal d'ajout d'avis */}
        <Modal 
          isOpen={showAddReviewModal} 
          onClose={() => setShowAddReviewModal(false)}
          className="max-w-2xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Laisser un avis</h3>
              <button 
                onClick={() => setShowAddReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                data-testid="button-close-review-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <Label htmlFor="booking">Choisir une réservation</Label>
                <Select
                  value={reviewForm.booking_id}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, booking_id: e.target.value }))}
                  data-testid="select-booking"
                >
                  <SelectOption value="">-- Sélectionner une réservation --</SelectOption>
                  {eligibleBookings
                    .filter(booking => !booking.has_review)
                    .map(booking => (
                      <SelectOption key={booking.id} value={booking.id}>
                        {booking.service} - {booking.date} à {booking.time}
                        {booking.status === 'completed' ? ' ✓' : ' (confirmée)'}
                      </SelectOption>
                    ))
                  }
                </Select>
              </div>

              <div>
                <Label>Note</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating }))}
                      className="p-1 hover:scale-110 transition-transform"
                      data-testid={`rating-star-${rating}`}
                    >
                      <Star 
                        className={`w-8 h-8 ${rating <= reviewForm.rating ? 'fill-pink-400 text-pink-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {reviewForm.rating} étoile{reviewForm.rating > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="comment">Votre commentaire</Label>
                <Textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Partagez votre expérience..."
                  rows="5"
                  data-testid="textarea-comment"
                />
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Votre avis sera vérifié par notre équipe avant d'être publié.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddReviewModal(false)}
                  className="flex-1"
                  data-testid="button-cancel-review"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !reviewForm.booking_id || !reviewForm.comment.trim()}
                  className="flex-1"
                  data-testid="button-submit-review"
                >
                  {submitting ? 'Envoi...' : 'Publier l\'avis'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </section>
  );
}