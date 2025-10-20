import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import MovieCard from '../components/ui/MovieCard';
import ReviewModal from '../components/ui/ReviewModal';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { LoaderCircle } from 'lucide-react'; // Import Loader

const HomePage = () => {
  const { user } = useAuth();
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [movieToReview, setMovieToReview] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // --- FETCH NOW PLAYING MOVIES ---
  useEffect(() => {
    const fetchNowPlaying = async () => {
      setIsLoadingMovies(true);
      try {
        console.log("Fetching Now Playing movies...");
        // --- CALL THE NEW ENDPOINT ---
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
  }, []); // Fetch only once on mount

  // --- MODAL HANDLERS ---
  const handleOpenReviewModal = (movie) => {
    // We must use 'movie.id' because our Pydantic model maps '_id' to 'id'
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

  // --- REVIEW SUBMISSION HANDLER ---
  const handleSubmitReview = async ({ rating, reviewText }) => {
    if (!movieToReview || !user || !user.id) {
      toast.error('Cannot submit review: user not logged in or movie data missing.');
      return;
    }
    setIsSubmittingReview(true);
    const loadingToast = toast.loading('Submitting your review...');
    try {
      // Your Pydantic model maps '_id' to 'id', so we always use 'id'
      const contentIdentifier = movieToReview.id; 
      
      const payload = {
        userId: String(user.id),
        contentId: String(contentIdentifier), // Use the correct ID
        rating: rating,
        reviewText: reviewText,
      };

      console.log("Submitting review payload:", payload);
      await api.post('/api/history', payload);

      toast.dismiss(loadingToast);
      toast.success('Review submitted successfully!');
      handleCloseReviewModal();
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
                    key={movie.id} // Use 'id' as Pydantic model provides it
                    movie={movie}
                    onReviewClick={() => handleOpenReviewModal(movie)}
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

      {/* Render Review Modal */}
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