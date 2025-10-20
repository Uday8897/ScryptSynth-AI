import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Lightbulb, Zap, Sparkles, Users, Map, Sword, Ghost, Rocket, Heart, Crown } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../../animations/variants';

const BrainstormPage = () => {
  const [genre, setGenre] = useState('');
  const [elementType, setElementType] = useState('');
  const [aiData, setAiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const genreIcons = {
    'horror': Ghost,
    'sci-fi': Rocket,
    'fantasy': Sword,
    'romance': Heart,
    'drama': Users,
    'thriller': Crown,
    'mystery': Sparkles,
    'adventure': Map
  };

  const getGenreIcon = (genreName) => {
    const lowerGenre = genreName?.toLowerCase();
    for (const [key, Icon] of Object.entries(genreIcons)) {
      if (lowerGenre?.includes(key)) return Icon;
    }
    return Lightbulb;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!genre.trim() && !elementType.trim()) {
      toast.error('Please provide at least one input.');
      return;
    }

    setIsLoading(true);
    setAiData(null);
    toast.loading('Brainstorming creative ideas...');

    try {
      // Combine inputs into a single query for the backend
      const query = `${genre}${elementType ? ' - ' + elementType : ''}`;
      const res = await api.post('/api/ai/creative/brainstorm', { query });
      
      if (res.data.success && res.data.data) {
        setAiData(res.data.data);
        toast.dismiss();
        toast.success('Creative ideas generated!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      toast.dismiss();
      const errorMsg = error.response?.data?.detail || 'The AI brainstorm session failed.';
      toast.error(errorMsg);
      setAiData({ error: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Render creative ideas
  const renderIdeas = (ideas) => {
    if (!ideas || !Array.isArray(ideas)) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ideas.map((idea, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className="p-6 rounded-xl bg-surface/80 border border-border hover:border-primary/30 transition-all duration-300 h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-display text-text-main">{idea.title}</h3>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 ml-3">
                <span className="text-primary font-bold text-sm">{index + 1}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-text-secondary leading-relaxed">{idea.description}</p>
              </div>
              
              {idea.uniqueness && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-yellow-400 font-semibold text-sm mb-1">What Makes It Unique</p>
                  <p className="text-yellow-300 text-sm">{idea.uniqueness}</p>
                </div>
              )}
              
              {idea.implementation_tip && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-400 font-semibold text-sm mb-1">Implementation Tip</p>
                  <p className="text-blue-300 text-sm">{idea.implementation_tip}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Render creative prompts
  const renderPrompts = (prompts) => {
    if (!prompts || !Array.isArray(prompts)) return null;

    return (
      <div className="space-y-3">
        {prompts.map((prompt, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className="flex items-start gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20"
          >
            <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <p className="text-text-main">{prompt}</p>
          </motion.div>
        ))}
      </div>
    );
  };

  const GenreIcon = getGenreIcon(aiData?.genre || genre);

  return (
    <motion.main 
      initial="hidden" 
      animate="visible" 
      variants={fadeIn} 
      className="min-h-screen bg-background py-12"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h1 className="mb-4 text-6xl font-display text-text-main tracking-tight uppercase">
            BRAINSTORM ELEMENTS
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Get creative, genre-specific ideas for plot twists, characters, settings, monsters, and anything else you need for your story.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="genre" className="block text-lg font-display text-text-main mb-3">
                Genre
              </label>
              <Input
                id="genre"
                type="text"
                placeholder="e.g., Horror, Sci-Fi, Fantasy, Romance, Thriller"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="text-lg p-4 rounded-xl"
              />
            </div>
            <div>
              <label htmlFor="elementType" className="block text-lg font-display text-text-main mb-3">
                Element Type
              </label>
              <Input
                id="elementType"
                type="text"
                placeholder="e.g., Plot Twists, Monsters, Characters, Settings, Magic Systems"
                value={elementType}
                onChange={(e) => setElementType(e.target.value)}
                className="text-lg p-4 rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!genre.trim() && !elementType.trim()}
            className="w-full py-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-lg font-semibold shadow-xl transition-all duration-300 rounded-2xl"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <Zap className="animate-spin" /> Brainstorming...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Lightbulb /> Generate Ideas
              </span>
            )}
          </Button>
        </motion.form>

        {/* AI Response Display */}
        {aiData && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Error State */}
            {aiData.error ? (
              <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
                <h3 className="text-2xl font-display text-red-400 mb-4">BRAINSTORMING FAILED</h3>
                <p className="text-text-secondary text-lg">{aiData.error}</p>
              </div>
            ) : (
              <>
                {/* Genre & Element Header */}
                <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-primary/20 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display text-primary mb-2 flex items-center gap-3">
                        <GenreIcon className="w-8 h-8" />
                        {aiData.genre || 'Creative'} Brainstorming
                      </h2>
                      <p className="text-text-secondary text-lg">
                        {aiData.element_type ? `Focus: ${aiData.element_type}` : 'General creative ideas'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {aiData.genre && (
                        <span className="px-4 py-2 bg-primary/20 text-primary rounded-full border border-primary/30 text-sm font-medium">
                          {aiData.genre}
                        </span>
                      )}
                      {aiData.element_type && (
                        <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 text-sm font-medium">
                          {aiData.element_type}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Creative Ideas */}
                {aiData.ideas && aiData.ideas.length > 0 && (
                  <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-border shadow-xl">
                    <h2 className="text-3xl font-display text-primary mb-6 flex items-center gap-3">
                      <Lightbulb className="w-8 h-8" />
                      Creative Ideas
                    </h2>
                    {renderIdeas(aiData.ideas)}
                  </motion.div>
                )}

                {/* Creative Prompts */}
                {aiData.creative_prompts && aiData.creative_prompts.length > 0 && (
                  <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-purple-500/20 shadow-xl">
                    <h2 className="text-3xl font-display text-purple-400 mb-6 flex items-center gap-3">
                      <Sparkles className="w-8 h-8" />
                      Creative Prompts
                    </h2>
                    <p className="text-text-secondary mb-4 text-lg">
                      Use these prompts to spark further creativity and explore your ideas in more depth:
                    </p>
                    {renderPrompts(aiData.creative_prompts)}
                  </motion.div>
                )}

                {/* Raw JSON Debug (optional - can be removed in production) */}
                {process.env.NODE_ENV === 'development' && (
                  <motion.div variants={fadeInUp} className="p-6 rounded-xl bg-surface/50 border border-border">
                    <details>
                      <summary className="cursor-pointer text-text-secondary text-sm font-mono">
                        Debug JSON
                      </summary>
                      <pre className="mt-4 text-xs text-text-secondary overflow-auto">
                        {JSON.stringify(aiData, null, 2)}
                      </pre>
                    </details>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Empty State Instructions */}
        {!aiData && !isLoading && (
          <motion.div variants={fadeInUp} className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Lightbulb className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-display text-text-main mb-2">Ready to Brainstorm</h3>
              <p className="text-text-secondary mb-6">
                Enter a genre and element type to get AI-powered creative ideas for your story.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-surface/50 border border-border">
                  <strong className="text-primary">Popular Genres</strong>
                  <div className="text-text-secondary mt-1">
                    Horror, Sci-Fi, Fantasy, Romance, Thriller, Mystery
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface/50 border border-border">
                  <strong className="text-primary">Element Types</strong>
                  <div className="text-text-secondary mt-1">
                    Plot Twists, Characters, Monsters, Settings, Magic Systems
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
};

export default BrainstormPage;