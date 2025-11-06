import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';
import { Star, Film, Zap, SearchX, History, BarChart3, LoaderCircle } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';
import MovieCard from '../components/ui/MovieCard';

const AIRecommenderPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [aiData, setAiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const textareaRef = useRef(null);

  const getUserId = () => {
    if (!user) return null;
    return user.id || user._id;
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = getUserId();
    
    if (!userId || !query.trim()) {
      toast.error('Please log in and enter a query.');
      return;
    }

    setIsLoading(true);
    setAiData(null);
    setSearchPerformed(false);
    toast.loading('Analyzing your cinematic profile...');

    try {
      const res = await api.post('/api/ai/recommend/personal', {
        user_id: String(userId),
        query,
      });
      
      const aiRecommendation = res.data;
      
      console.log('🔍 FULL AI RESPONSE:', aiRecommendation); // Debug log
      
      if (!aiRecommendation || aiRecommendation.error) {
        throw new Error(aiRecommendation?.error || "Invalid response structure from AI service.");
      }
      
      // FIX: Better movie data normalization
      if (aiRecommendation.recommendations) {
        aiRecommendation.recommendations = aiRecommendation.recommendations.map(movie => {
          console.log('🎬 RAW MOVIE DATA:', movie); // Debug each movie
          
          // Normalize the movie data - handle different field names
          const normalizedMovie = {
            // Use tmdbId if available, otherwise use id, otherwise fallback to 0
            tmdbId: movie.tmdbId || movie.id || 0,
            title: movie.title || 'Unknown Title',
            year: movie.year || movie.release_year || 0,
            rating: movie.rating || movie.vote_average || 0,
            genres: movie.genres || [],
            overview: movie.overview || '',
            poster_path: movie.poster_path || '',
            poster_url: movie.poster_url || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''),
            source: movie.source || 'ai_recommendation',
            similarity: movie.similarity || 0,
            match_confidence: movie.match_confidence || 0.5
          };
          
          console.log('🎯 NORMALIZED MOVIE:', normalizedMovie); // Debug normalized movie
          return normalizedMovie;
        }).filter(movie => {
          // Only keep movies with valid TMDB IDs
          const isValid = movie.tmdbId && movie.tmdbId > 0;
          if (!isValid) {
            console.log('❌ FILTERED OUT MOVIE (invalid ID):', movie);
          }
          return isValid;
        });
      }
      
      setAiData(aiRecommendation);
      
      if (aiRecommendation?.recommendations?.length > 0) {
        toast.dismiss();
        toast.success(`Found ${aiRecommendation.recommendations.length} matching film(s)!`);
      } else {
        toast.dismiss();
        toast('AI analyzed your profile but found no valid matches in our database.', { icon: '🤔' });
      }
      
      setSearchPerformed(true);
      
    } catch (error) {
      toast.dismiss();
      console.error('Recommendation error:', error);
      let errorMsg = error.message || "Unable to retrieve recommendation.";
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      setAiData({ error: errorMsg });
      setSearchPerformed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen bg-background py-12"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h1 className="mb-4 text-6xl font-display text-text-main tracking-tight uppercase">
            CINEMATIC COMPANION
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Our AI analyzes your past reviews and ratings to suggest films you'll truly love.
          </p>
        </motion.div>
        
        {/* Input Form */}
        <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="mb-12 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what type of movie you're in the mood for... (e.g., 'A sci-fi movie with deep philosophical themes like Interstellar')"
            className="w-full p-4 rounded-xl border border-border bg-surface text-text-main focus:outline-none focus:ring-4 focus:ring-primary/20 resize-none transition-all duration-300 min-h-[100px]"
            rows={3}
          />
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!query.trim() || !getUserId()}
            className="mt-4 w-full py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-lg font-semibold shadow-xl transition-all duration-300"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="animate-spin" />
                Analyzing Your Taste...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap /> Get Personalized Recommendation
              </span>
            )}
          </Button>
        </motion.form>

        {/* Results Display */}
        {!isLoading && searchPerformed && (
          <motion.div
            key={Date.now()}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-7xl mx-auto mt-12"
          >
            {aiData?.error ? (
              <div className="p-8 rounded-2xl bg-surface border border-red-500/30 shadow-2xl text-center">
                <h3 className="text-2xl font-display text-red-400 mb-4">RECOMMENDATION FAILED</h3>
                <p className="text-text-secondary text-lg">{aiData.error}</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* AI Reasoning */}
                <motion.div
                  variants={fadeInUp}
                  className="w-full lg:w-3/5 relative rounded-lg overflow-hidden shadow-xl border border-primary/20 bg-gradient-to-br from-surface/80 to-background/80 backdrop-blur-sm p-6"
                >
                  <div className="relative z-10">
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                      <motion.h3 variants={fadeInUp} className="text-2xl font-display text-primary mb-3 text-center md:text-left">
                        AI Analysis
                      </motion.h3>
                      
                      {aiData?.personalized_explanation && (
                        <motion.div variants={fadeInUp} className="mb-6">
                          <p className="text-text-secondary leading-relaxed text-center md:text-left">
                            {aiData.personalized_explanation}
                          </p>
                        </motion.div>
                      )}

                      {aiData?.user_insights && (
                        <motion.div variants={fadeInUp} className="mb-6">
                          <h4 className="text-lg font-semibold text-primary mb-3">Based on Your Preferences</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {aiData.user_insights.preferred_genres?.length > 0 && (
                              <div className="p-3 rounded-lg bg-background/60 border border-border">
                                <span className="text-text-secondary">Preferred Genres: </span>
                                <span className="text-primary font-medium">
                                  {aiData.user_insights.preferred_genres.join(', ')}
                                </span>
                              </div>
                            )}
                            <div className="p-3 rounded-lg bg-background/60 border border-border">
                              <span className="text-text-secondary">Personalization: </span>
                              <span className="text-primary font-medium capitalize">
                                {aiData.user_insights.personalization_level || 'medium'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Recommended Movies */}
                <motion.div
                  variants={fadeInUp}
                  className="w-full lg:w-2/5 flex-shrink-0"
                >
                  <p className="text-lg uppercase tracking-widest text-primary font-semibold mb-4 text-center lg:text-left">
                    Recommended Film{aiData?.recommendations?.length !== 1 ? 's' : ''}
                  </p>
                  
                  {aiData?.recommendations?.length > 0 ? (
                    <div className="space-y-4">
                      {aiData.recommendations.map((movie, index) => (
                        <div key={movie.tmdbId} className="relative">
                          <MovieCard movie={movie} />
                          {movie.match_confidence && (
                            <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                              {Math.round(movie.match_confidence * 100)}% Match
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 bg-surface rounded-lg border border-border text-center">
                      <SearchX size={48} className="mx-auto mb-4 text-red-500" />
                      <h4 className="text-lg font-semibold text-text-main mb-2">No Movies Found</h4>
                      <p className="text-text-secondary text-sm">
                        The AI found matches but they couldn't be displayed due to missing data.
                      </p>
                      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600">
                        <strong>Debug Info:</strong> Check browser console for detailed movie data
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* No User ID Warning */}
        {!getUserId() && (
          <motion.div variants={fadeInUp} className="mt-8 p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-center">
            <p className="text-yellow-400">
              Please log in to get personalized recommendations based on your review history.
            </p>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
};

export default AIRecommenderPage;