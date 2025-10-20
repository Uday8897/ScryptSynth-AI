import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import ReviewModal from '../components/ui/ReviewModal';
import { Star, Calendar, ListPlus, Edit, XCircle } from 'lucide-react';
import { fadeIn, fadeInUp } from '../animations/variants';

const MovieDetailPage = () => {
  const { movieId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // ✅ Unified helper for consistent ID usage
  const getMovieId = (movieObj) => String(movieObj.id || movieObj._id || '');

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setInitialCheckDone(false);
      setMovie(null);
      setIsInWatchlist(false);

      if (!movieId || movieId === 'undefined' || !user?.id) {
        toast.error('Invalid movie ID or user session.');
        setIsLoading(false);
        return;
      }

      let fetchedMovie = null;

      try {
        // --- Try LOCAL DB ---
        console.log(`[Effect] Attempting fetch from local DB for: ${movieId}`);
        const movieResponse = await api.get(`/api/content/movies/${movieId}`);
        fetchedMovie = movieResponse.data;
      } catch (localError) {
        console.warn('[Effect] Local fetch failed:', localError.response?.status);
        if (localError.response?.status === 404) {
          try {
            // --- Fallback: TMDB ---
            console.log('[Effect] Fallback: fetching from TMDB...');
            const tmdbResponse = await api.get(`/api/content/tmdb/${movieId}`);
            fetchedMovie = tmdbResponse.data;
          } catch (tmdbError) {
            console.error('[Effect] Failed to fetch from TMDB:', tmdbError);
            toast.error('Could not load movie details from any source.');
          }
        } else {
          toast.error('Failed to load movie details.');
        }
      }

      if (fetchedMovie && getMovieId(fetchedMovie)) {
        setMovie(fetchedMovie);

        // --- Check Watchlist ---
        try {
          const watchlistResponse = await api.get('/api/history/watchlist/my');
          const currentWatchlist = watchlistResponse.data;

          if (!Array.isArray(currentWatchlist)) {
            throw new Error('Invalid watchlist format received.');
          }

          const movieContentIdString = getMovieId(fetchedMovie);
          const foundInWatchlist = currentWatchlist.some((item) => {
            const itemContentIdString = item?.contentId
              ? String(item.contentId).replace('tmdb_', '')
              : null;
            return itemContentIdString === movieContentIdString;
          });

          setIsInWatchlist(foundInWatchlist);
          console.log(`[Effect] Movie ${movieContentIdString} in watchlist: ${foundInWatchlist}`);
        } catch (watchlistError) {
          console.error('[Effect] Watchlist fetch error:', watchlistError);
          toast.error('Could not verify watchlist status.');
        } finally {
          setInitialCheckDone(true);
        }
      } else {
        setMovie(null);
        setInitialCheckDone(true);
      }

      setIsLoading(false);
    };

    if (user?.id) {
      fetchAllData();
    } else {
      setIsLoading(false);
    }
  }, [movieId, user?.id]);

  // --- Review Submit Handler ---
  const handleSubmitReview = async ({ rating, reviewText }) => {
    if (!movie || !user?.id) {
      toast.error('Cannot submit review: user not logged in or movie data missing.');
      return;
    }

    setIsSubmittingReview(true);
    const loadingToast = toast.loading('Submitting your review...');
    try {
      const payload = {
        userId: String(user.id),
        contentId: getMovieId(movie),
        rating,
        reviewText,
      };
      await api.post('/api/history', payload);
      toast.dismiss(loadingToast);
      toast.success('Review submitted successfully!');
      setIsReviewModalOpen(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to submit review. Please try again.');
      console.error('Review submission error:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // --- Watchlist Toggle Handler ---
  const handleToggleWatchlist = async () => {
    if (!user?.id || !movie || isWatchlistLoading) return;
    setIsWatchlistLoading(true);

    const contentId = getMovieId(movie);
    const adding = !isInWatchlist;

    try {
      const endpoint = `/api/history/watchlist/${contentId}`;
      if (adding) {
        await api.post(endpoint);
        setIsInWatchlist(true);
        toast.success(`${movie.title} added to watchlist!`);
      } else {
        await api.delete(endpoint);
        setIsInWatchlist(false);
        toast.success(`${movie.title} removed from watchlist!`);
      }
    } catch (error) {
      toast.error(`Failed to ${adding ? 'add to' : 'remove from'} watchlist.`);
      console.error('Watchlist toggle error:', error);
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  // --- Render States ---
  if (isLoading && !initialCheckDone) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <p className="text-text-secondary text-lg animate-pulse">Loading cinematic data...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-64px)] text-center">
        <p className="text-red-500 text-2xl font-semibold mb-4">Error: Movie Not Found</p>
        <p className="text-text-secondary mb-6">The requested movie details could not be loaded.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-violet-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all"
        >
          Go Back Home
        </motion.button>
      </div>
    );
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
    : '/placeholder-poster.png';
  const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';

  return (
    <motion.main initial="hidden" animate="visible" variants={fadeIn} className="p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fadeInUp} className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Poster */}
          <motion.div
            layoutId={`movie-poster-${getMovieId(movie)}`}
            className="w-full lg:w-[300px] xl:w-[400px] flex-shrink-0 rounded-lg overflow-hidden shadow-2xl bg-surface"
          >
            <img src={posterUrl} alt={movie.title} className="w-full h-auto object-cover" />
          </motion.div>

          {/* Details */}
          <motion.div variants={fadeInUp} className="w-full flex flex-col">
            <div>
              <h1 className="text-4xl lg:text-6xl font-display text-text-main mb-3 leading-tight">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 text-text-secondary mb-6 text-base md:text-lg">
                <span className="flex items-center gap-1.5">
                  <Calendar size={18} className="text-primary/80" /> {year}
                </span>
                {movie.vote_average > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                    <Star size={18} fill="currentColor" /> {movie.vote_average.toFixed(1)} / 10
                  </span>
                )}
                {movie.genres?.length > 0 && (
                  <span>{movie.genres.join(' • ')}</span>
                )}
              </div>
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-display text-primary mb-2 uppercase tracking-wider">Overview</h2>
              <p className="text-text-secondary leading-relaxed text-base md:text-lg">
                {movie.overview || 'No overview available.'}
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-4 border-t border-border/50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsReviewModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg"
              >
                <Edit size={20} /> Log / Review
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleWatchlist}
                disabled={isWatchlistLoading || !initialCheckDone}
                className={`flex items-center justify-center gap-2 font-semibold py-3 px-8 rounded-lg border transition-all ${
                  isInWatchlist
                    ? 'bg-red-600/10 text-red-400 border-red-500/50 hover:bg-red-600/20'
                    : 'bg-surface hover:bg-gray-700 text-text-main border-border'
                }`}
              >
                {isWatchlistLoading ? (
                  <motion.div className="animate-spin rounded-full h-5 w-5 border-b-2 border-text-secondary"></motion.div>
                ) : isInWatchlist ? (
                  <XCircle size={20} />
                ) : (
                  <ListPlus size={20} />
                )}
                {isWatchlistLoading ? 'Updating...' : isInWatchlist ? 'Remove Watchlist' : 'Add to Watchlist'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Reviews Section Placeholder */}
        <div className="mt-12 border-t border-border/50 pt-8">
          <h2 className="text-3xl font-display text-primary mb-6">User Reviews</h2>
          <p className="text-text-secondary italic">(User reviews section coming soon...)</p>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && movie && (
          <ReviewModal
            movie={movie}
            onClose={() => setIsReviewModalOpen(false)}
            onSubmit={handleSubmitReview}
            isSubmitting={isSubmittingReview}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
};

export default MovieDetailPage;
