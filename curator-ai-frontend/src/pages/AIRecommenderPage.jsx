import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import { Star, Film, Zap, SearchX } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';
import MovieCard from '../components/ui/MovieCard';

const AIRecommenderPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [aiData, setAiData] = useState(null); // Holds the AI's reasoning JSON
  const [matchedMovies, setMatchedMovies] = useState([]); // Holds movies found by search
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false); // Track if search completed
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please describe what you’re in the mood for.');
      return;
    }

    setIsLoading(true);
    setAiData(null);
    setMatchedMovies([]);
    setSearchPerformed(false);
    toast.loading('Consulting the cinematic oracle...');

    try {
      // 1. Get Recommendation JSON from AI Service
      const res = await api.post('/api/ai/recommend/personal', {
        user_id: String(user.id),
        query,
      });
      const aiRecommendation = JSON.parse(res.data.response);
      setAiData(aiRecommendation); // Store AI reasoning

      // 2. Extract Title and Year
      const title = aiRecommendation?.recommendedMovie?.title;
      const year = aiRecommendation?.recommendedMovie?.year;

      if (title) {
        // 3. Search for the movie in Content-Search-Service
        try {
          const searchRes = await api.get('/api/content/search', {
            params: { query: title }
          });

          let foundMovies = searchRes.data;

          // Filter by year if provided
          if (year && foundMovies.length > 1) {
            foundMovies = foundMovies.filter(movie =>
              movie.release_date && movie.release_date.startsWith(String(year))
            );
          }

          setMatchedMovies(foundMovies);
          setSearchPerformed(true);
          toast.dismiss();
          toast.success('Recommendation received and located!');
        } catch (searchError) {
          // Handle search errors
          if (searchError.response?.status === 404) {
            toast.dismiss();
            toast.warn(`No movies found matching "${title}".`);
          } else {
            console.error(`Failed to search for recommended movie "${title}":`, searchError);
            toast.dismiss();
            toast.error('Error searching for the recommended movie.');
          }
          setSearchPerformed(true);
        }
      } else {
        toast.dismiss();
        toast.warn('AI provided reasoning, but no specific movie title.');
        setAiData(prev => ({ ...prev, error: "AI could not pinpoint a specific movie title." }));
        setSearchPerformed(true);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Connection lost to recommendation engine.');
      setAiData({
        error: error instanceof SyntaxError
          ? "AI signal corrupted. Please try again."
          : "Unable to retrieve recommendation."
      });
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
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h1 className="mb-4 text-6xl font-display text-text-main tracking-tight uppercase">
            CINEMATIC COMPANION
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Our AI studies your past ratings and reviews to suggest the next film you’ll truly love.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="mb-12">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what type of movie you’re in the mood for..."
            className="w-full p-4 rounded-xl border border-border bg-surface text-text-main focus:outline-none focus:ring-4 focus:ring-primary/20 resize-none transition-all duration-300 min-h-[100px]"
          />
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!query.trim()}
            className="mt-4 w-full py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-lg font-semibold shadow-xl transition-all duration-300"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Zap className="animate-spin" /> Analyzing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap /> Get Recommendation
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
            className="max-w-5xl mx-auto mt-12"
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
                        {aiData?.reasoningTitle || "AI Analysis"}
                      </motion.h3>
                      <motion.p variants={fadeInUp} className="text-text-secondary leading-relaxed mb-6 text-center md:text-left">
                        {aiData?.reasoningIntro || "Here's why this film aligns with your profile:"}
                      </motion.p>

                      {/* Feature Comparison */}
                      <motion.div variants={staggerContainer} className="grid grid-cols-1 gap-4 mb-6">
                        {aiData?.comparisonTable?.map((item, index) => (
                          <motion.div
                            key={index}
                            variants={fadeInUp}
                            className="group p-4 rounded-lg bg-background/60 border border-border hover:border-primary/50 transition-all duration-300 backdrop-blur-sm"
                          >
                            <div className="flex items-center gap-3 mb-1">
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                              <p className="font-semibold text-primary text-sm uppercase tracking-wide">{item.feature}</p>
                            </div>
                            <p className="text-text-secondary text-sm leading-relaxed pl-5">{item.match}</p>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Final Verdict */}
                      <motion.div variants={fadeInUp} className="text-center md:text-left border-t border-border pt-4">
                        <h4 className="text-lg font-display text-primary mb-2">Final Verdict</h4>
                        <p className="text-base italic text-text-main leading-relaxed">
                          {aiData?.bottomLine || "A highly recommended match based on your profile."}
                        </p>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Matched Movie(s) */}
                <motion.div
                  variants={fadeInUp}
                  className="w-full lg:w-2/5 flex-shrink-0"
                >
                  <p className="text-lg uppercase tracking-widest text-primary font-semibold mb-4 text-center lg:text-left">
                    Matching Film{matchedMovies.length !== 1 ? 's' : ''}
                  </p>
                  {matchedMovies.length > 0 ? (
                    <div className={`grid ${matchedMovies.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                      {matchedMovies.map((movie) => (
                        <MovieCard key={movie._id} movie={movie} />
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-[2/3] bg-surface rounded-lg flex flex-col items-center justify-center text-text-secondary p-4 text-center border border-border">
                      <SearchX size={40} className="mb-2 text-red-500"/>
                      <p className="text-sm">
                        Could not find "{aiData?.recommendedMovie?.title}" in our database.
                      </p>
                    </div>
                  )}
                </motion.div>

              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.main>
  );
};

export default AIRecommenderPage;
