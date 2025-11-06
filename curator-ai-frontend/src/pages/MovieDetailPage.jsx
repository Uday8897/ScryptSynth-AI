import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import ReviewModal from '../components/ui/ReviewModal';
import { 
  Star, 
  Calendar, 
  ListPlus, 
  Edit, 
  XCircle, 
  Tv, 
  ExternalLink, 
  Film, 
  Users, 
  Video, 
  Play,
  Clock,
  Award,
  Heart
} from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';

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
  const [activeTab, setActiveTab] = useState('overview');

  const getMovieId = (movieObj) => {
    if (!movieObj) return '';
    return String(movieObj._id || movieObj.id || '');
  };

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
        const movieResponse = await api.get(`/api/content/movies/${movieId}/complete`);
        fetchedMovie = movieResponse.data;
        console.log('🎬 COMPLETE MOVIE DATA:', fetchedMovie);
      } catch (completeError) {
        console.warn('[Effect] Complete endpoint failed:', completeError.response?.status);
        try {
          const movieResponse = await api.get(`/api/content/movies/${movieId}`);
          fetchedMovie = movieResponse.data;
        } catch (localError) {
          console.warn('[Effect] Local fetch failed:', localError.response?.status);
          if (localError.response?.status === 404) {
            try {
              const tmdbResponse = await api.get(`/api/content/tmdb/${movieId}`);
              fetchedMovie = tmdbResponse.data;
            } catch (tmdbError) {
              console.error('[Effect] Failed to fetch from TMDB:', tmdbError);
              toast.error('Could not load movie details from any source.');
            }
          }
        }
      }

      if (fetchedMovie && getMovieId(fetchedMovie)) {
        setMovie(fetchedMovie);
        // Check watchlist status
        try {
          const watchlistResponse = await api.get('/api/history/watchlist/my');
          const currentWatchlist = watchlistResponse.data;
          if (Array.isArray(currentWatchlist)) {
            const movieContentIdString = getMovieId(fetchedMovie);
            const foundInWatchlist = currentWatchlist.some((item) => {
              const itemContentIdString = item?.contentId ? String(item.contentId).replace('tmdb_', '') : null;
              return itemContentIdString === movieContentIdString;
            });
            setIsInWatchlist(foundInWatchlist);
          }
        } catch (watchlistError) {
          console.error('[Effect] Watchlist fetch error:', watchlistError);
        } finally {
          setInitialCheckDone(true);
        }
      } else {
        setMovie(null);
        setInitialCheckDone(true);
      }
      setIsLoading(false);
    };

    if (user?.id) fetchAllData();
    else setIsLoading(false);
  }, [movieId, user?.id]);

  // --- Helper Functions ---
  const handleSubmitReview = async ({ rating, reviewText }) => {
    if (!movie || !user?.id) return;
    setIsSubmittingReview(true);
    const loadingToast = toast.loading('Submitting your review...');
    try {
      const payload = { userId: String(user.id), contentId: getMovieId(movie), rating, reviewText };
      await api.post('/api/history', payload);
      toast.dismiss(loadingToast);
      toast.success('Review submitted successfully!');
      setIsReviewModalOpen(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  // --- Render Components ---
  const renderHeroSection = () => (
    <div className="relative bg-gradient-to-br from-surface to-background rounded-2xl overflow-hidden shadow-2xl mb-8">
      <div className="absolute inset-0 bg-black/20 z-0" />
      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Poster */}
          <motion.div
            layoutId={`movie-poster-${getMovieId(movie)}`}
            className="w-full lg:w-80 xl:w-96 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl bg-surface"
          >
            <img 
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` : '/placeholder-poster.png'} 
              alt={movie.title} 
              className="w-full h-auto object-cover"
            />
          </motion.div>

          {/* Movie Info */}
          <div className="flex-1 text-white">
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl lg:text-6xl font-bold mb-4 leading-tight"
            >
              {movie.title}
            </motion.h1>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Calendar size={16} />
                <span>{movie.release_date?.substring(0, 4) || 'N/A'}</span>
              </div>
              
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
              )}

              {movie.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.slice(0, 3).map((genre, index) => (
                    <span key={index} className="bg-primary/80 px-3 py-1 rounded-full text-sm font-medium">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.p variants={fadeInUp} className="text-lg text-white/90 leading-relaxed mb-8 max-w-3xl">
              {movie.overview || 'No overview available.'}
            </motion.p>

            {/* Action Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsReviewModalOpen(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Edit size={20} />
                Rate & Review
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleWatchlist}
                disabled={isWatchlistLoading}
                className={`flex items-center gap-3 font-semibold py-3 px-6 rounded-xl border transition-all ${
                  isInWatchlist
                    ? 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                {isWatchlistLoading ? (
                  <motion.div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                ) : isInWatchlist ? (
                  <XCircle size={20} />
                ) : (
                  <Heart size={20} />
                )}
                {isWatchlistLoading ? 'Updating...' : isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="border-b border-border/50 mb-8">
      <nav className="flex space-x-8">
        {['overview', 'cast', 'videos', 'similar'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-1 font-semibold text-lg border-b-2 transition-all capitalize ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-main'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface/50 p-4 rounded-xl text-center">
            <Award className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-main">{movie.vote_average?.toFixed(1)}</div>
            <div className="text-sm text-text-secondary">Rating</div>
          </div>
          <div className="bg-surface/50 p-4 rounded-xl text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-main">{movie.release_date?.substring(0, 4)}</div>
            <div className="text-sm text-text-secondary">Year</div>
          </div>
          <div className="bg-surface/50 p-4 rounded-xl text-center">
            <Film className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-main">{movie.genres?.length || 0}</div>
            <div className="text-sm text-text-secondary">Genres</div>
          </div>
          <div className="bg-surface/50 p-4 rounded-xl text-center">
            <Star className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-main">10.0</div>
            <div className="text-sm text-text-secondary">Score</div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="bg-surface/30 p-6 rounded-xl border border-border">
          <h3 className="text-xl font-bold text-text-main mb-4">Movie Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">Movie ID:</span>
              <span className="text-text-main font-mono ml-2">{getMovieId(movie)}</span>
            </div>
            <div>
              <span className="text-text-secondary">Release Date:</span>
              <span className="text-text-main ml-2">{movie.release_date || 'N/A'}</span>
            </div>
            <div>
              <span className="text-text-secondary">Original Language:</span>
              <span className="text-text-main ml-2 capitalize">{movie.original_language || 'N/A'}</span>
            </div>
            <div>
              <span className="text-text-secondary">Popularity:</span>
              <span className="text-text-main ml-2">{movie.popularity?.toFixed(0) || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Watch Providers */}
      <div className="bg-surface/50 p-6 rounded-xl border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Tv className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-text-main">Where to Watch</h3>
        </div>
        
        {movie.watch_providers?.link && (
          <a
            href={movie.watch_providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-violet-600 text-white font-semibold py-2 px-4 rounded-lg transition-all mb-4"
          >
            <ExternalLink size={16} />
            View on TMDB
          </a>
        )}

        {!movie.watch_providers?.flatrate && !movie.watch_providers?.rent && !movie.watch_providers?.buy ? (
          <p className="text-text-secondary italic text-center py-8">No streaming options available</p>
        ) : (
          <div className="space-y-4">
            {['flatrate', 'rent', 'buy'].map((type) => 
              movie.watch_providers?.[type]?.length > 0 && (
                <div key={type}>
                  <h4 className="font-semibold text-text-main mb-2 capitalize">{type}</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.watch_providers[type].slice(0, 4).map((provider, index) => (
                      <img
                        key={index}
                        src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-10 h-10 rounded-lg object-cover bg-surface"
                        title={provider.provider_name}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderCast = () => {
    if (!movie.credits) return <p className="text-text-secondary text-center py-8">No cast information available</p>;

    // Remove duplicate cast members
    const uniqueCast = movie.credits.cast?.filter((person, index, self) => 
      index === self.findIndex(p => p.id === person.id)
    ).slice(0, 12) || [];

    const directors = movie.credits.crew?.filter(person => person.job === 'Director') || [];

    return (
      <div className="space-y-8">
        {/* Directors */}
        {directors.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-text-main mb-4">Directors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {directors.map((director, index) => (
                <div key={index} className="bg-surface/30 p-4 rounded-xl border border-border">
                  <p className="font-semibold text-text-main">{director.name}</p>
                  <p className="text-text-secondary text-sm">Director</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cast */}
        <div>
          <h3 className="text-2xl font-bold text-text-main mb-4">Cast</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {uniqueCast.map((actor, index) => (
              <motion.div
                key={actor.id}
                whileHover={{ scale: 1.05 }}
                className="bg-surface/30 rounded-xl overflow-hidden border border-border cursor-pointer group"
              >
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${actor.profile_path}`}
                    alt={actor.name}
                    className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-surface flex items-center justify-center">
                    <Users className="w-8 h-8 text-text-secondary" />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-text-main text-sm line-clamp-1">{actor.name}</p>
                  <p className="text-text-secondary text-xs line-clamp-1">{actor.character}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVideos = () => {
    if (!movie.videos || movie.videos.length === 0) {
      return <p className="text-text-secondary text-center py-8">No videos available</p>;
    }

    const trailers = movie.videos.filter(video => video.type === 'Trailer').slice(0, 6);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trailers.map((video, index) => (
          <motion.div
            key={video.id}
            whileHover={{ scale: 1.02 }}
            className="bg-surface/30 rounded-xl overflow-hidden border border-border group cursor-pointer"
            onClick={() => window.open(`https://www.youtube.com/watch?v=${video.key}`, '_blank')}
          >
            <div className="relative aspect-video bg-surface">
              <img
                src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                alt={video.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                <Play className="w-12 h-12 text-white fill-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-text-main text-sm line-clamp-2 mb-1">{video.name}</h4>
              <p className="text-text-secondary text-xs capitalize">{video.type} • {video.site}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderSimilarMovies = () => {
    if (!movie.similar_movies || movie.similar_movies.length === 0) {
      return <p className="text-text-secondary text-center py-8">No similar movies found</p>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {movie.similar_movies.slice(0, 12).map((similarMovie, index) => (
          <motion.div
            key={similarMovie.id}
            whileHover={{ scale: 1.05 }}
            className="bg-surface/30 rounded-xl overflow-hidden border border-border cursor-pointer group"
            onClick={() => navigate(`/movie/${similarMovie.id}`)}
          >
            {similarMovie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w300${similarMovie.poster_path}`}
                alt={similarMovie.title}
                className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-surface flex items-center justify-center">
                <Film className="w-8 h-8 text-text-secondary" />
              </div>
            )}
            <div className="p-3">
              <p className="font-semibold text-text-main text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {similarMovie.title}
              </p>
              {similarMovie.vote_average > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-text-secondary text-xs">{similarMovie.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'cast': return renderCast();
      case 'videos': return renderVideos();
      case 'similar': return renderSimilarMovies();
      default: return renderOverview();
    }
  };

  // --- Render States ---
  if (isLoading && !initialCheckDone) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary text-lg">Loading cinematic experience...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-8">
        <Film className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-text-main mb-2">Movie Not Found</h1>
        <p className="text-text-secondary mb-6">The movie you're looking for doesn't exist in our database.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="bg-primary hover:bg-violet-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all"
        >
          Discover Movies
        </motion.button>
      </div>
    );
  }

  return (
    <motion.main 
      initial="hidden" 
      animate="visible" 
      variants={fadeIn} 
      className="min-h-screen bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderHeroSection()}
        {renderTabs()}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
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