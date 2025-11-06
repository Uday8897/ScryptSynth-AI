import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import MovieCard from '../components/ui/MovieCard';
import ReviewModal from '../components/ui/ReviewModal';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { LoaderCircle, Star, BarChart3 } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [movieToReview, setMovieToReview] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [userInsights, setUserInsights] = useState(null);

  // Fetch user insights on component mount
  useEffect(() => {
    if (user?._id) {
      loadUserInsights();
    }
  }, [user]);

  const loadUserInsights = async () => {
    try {
      const res = await api.get(`/api/ai/users/${user._id}/insights`);
      setUserInsights(res.data);
    } catch (error) {
      console.error('Failed to load user insights:', error);
    }
  };

  // Fetch now playing movies
  useEffect(() => {
    const fetchNowPlaying = async () => {
      setIsLoadingMovies(true);
      try {
        console.log("Fetching Now Playing movies...");
        const response = await api.get('/api/content/now-playing?region=IN');
        
        const movies = Array.isArray(response.data) ? response.data : [];
        console.log("Fetched Now Playing movies:", movies);
        setNowPlayingMovies(movies);

      } catch (error) {
        console.error("Failed to fetch Now Playing movies:", error);
        toast.error("Could not load movies playing now.");
        setNowPlayingMovies([]);
      } finally {
        setIsLoadingMovies(false);
      }
    };
    fetchNowPlaying();
  }, []);

  // Modal handlers
  const handleOpenReviewModal = (movie) => {
    if (!movie || typeof movie.id === 'undefined') {
        console.error("Movie object is invalid or missing ID:", movie);
        toast.error("Cannot review movie: data is missing.");
        return;
    }
    setMovieToReview(movie);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setMovieToReview(null);
  };

  // Enhanced review submission with AI memory storage
  // In your HomePage component, update the handleSubmitReview function:

const handleSubmitReview = async ({ rating, reviewText }) => {
  const userId = user?._id || user?.id;
  if (!movieToReview || !userId) {
    toast.error('Cannot submit review: user not logged in or movie data missing.');
    return;
  }
  
  setIsSubmittingReview(true);
  const loadingToast = toast.loading('Submitting your review and updating AI memory...');
  
  try {
    const contentIdentifier = movieToReview.id; 
    
    // 1. Submit to history service
    const historyPayload = {
      userId: String(userId),
      contentId: String(contentIdentifier),
      rating: rating,
      reviewText: reviewText,
    };

    console.log("Submitting review payload:", historyPayload);
    await api.post('/api/history', historyPayload);

    // 2. Store in AI memory for better recommendations
    try {
      await api.post('/api/ai/reviews/add', {
        user_id: String(userId),
        movie_title: movieToReview.title,
        review_text: reviewText,
        rating: rating,
      });
      console.log("Review stored in AI memory");
    } catch (memoryError) {
      console.warn("Failed to store in AI memory, but review was saved:", memoryError);
    }

    toast.dismiss(loadingToast);
    toast.success('Review submitted! AI will use this for better recommendations.');
    handleCloseReviewModal();
    
    // Reload user insights to reflect new review
    loadUserInsights();
    
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error('Failed to submit review. Please try again.');
    console.error("Review submission error:", error.response?.data || error.message);
  } finally {
    setIsSubmittingReview(false);
  }
};

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="p-8"
    >
      {/* User Insights Panel */}
      {userInsights && userInsights.total_reviews > 0 && (
        <motion.div variants={fadeInUp} className="mb-8 p-6 rounded-2xl bg-surface/50 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-main">Your Movie Profile</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-display text-primary mb-1">{userInsights.total_reviews}</div>
              <div className="text-text-secondary">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-display text-primary mb-1 flex items-center justify-center gap-1">
                {userInsights.insights?.average_rating ? userInsights.insights.average_rating.toFixed(1) : 'N/A'}
                <Star className="w-4 h-4 fill-current" />
              </div>
              <div className="text-text-secondary">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-display text-primary mb-1">
                {userInsights.insights?.genres?.length || 0}
              </div>
              <div className="text-text-secondary">Genres</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-display text-primary mb-1">
                {userInsights.insights?.preferred_movies?.length || 0}
              </div>
              <div className="text-text-secondary">Movies</div>
            </div>
          </div>
          
          {userInsights.insights?.genres?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-text-secondary text-sm mb-2">Your Preferred Genres:</p>
              <div className="flex flex-wrap gap-2">
                {userInsights.insights.genres.slice(0, 5).map((genre, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs border border-primary/30">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Now Playing Section */}
      <motion.h2
        variants={fadeInUp}
        className="mb-8 text-4xl font-display text-text-main tracking-wider uppercase"
        style={{ textShadow: '0 0 15px rgba(139, 92, 246, 0.4)' }}
      >
        Now Playing in Theaters
      </motion.h2>

      {isLoadingMovies ? (
        <div className="flex justify-center items-center h-64">
           <LoaderCircle size={40} className="animate-spin text-primary" />
           <p className="ml-4 text-text-secondary text-lg">Fetching current screenings...</p>
        </div>
      ) : nowPlayingMovies.length > 0 ? (
         <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
        >
            {nowPlayingMovies.map(movie => (
                <MovieCard
                    key={movie.id}
                    movie={movie}
                    onReviewClick={() => handleOpenReviewModal(movie)}
                    showReviewButton={true}
                />
            ))}
        </motion.div>
      ) : (
         <motion.div
             variants={fadeInUp}
             className="text-center py-12 px-6 bg-surface rounded-lg border border-border"
         >
            <p className="text-text-secondary text-lg italic">Could not find movies currently playing.</p>
         </motion.div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && movieToReview && (
          <ReviewModal
            movie={movieToReview}
            onClose={handleCloseReviewModal}
            onSubmit={handleSubmitReview}
            isSubmitting={isSubmittingReview}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
};

export default HomePage;