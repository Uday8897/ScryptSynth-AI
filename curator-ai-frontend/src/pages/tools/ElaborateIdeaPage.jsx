import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { Brain, Zap, Users, BookOpen, Target, Sparkles, FileText, Heart } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../../animations/variants';

const ElaborateIdeaPage = () => {
  const [idea, setIdea] = useState('');
  const [aiData, setAiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [idea]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idea.trim()) {
      toast.error('Please enter your story idea to elaborate.');
      return;
    }

    setIsLoading(true);
    setAiData(null);
    toast.loading('Developing your story concept...');

    try {
      const res = await api.post('/api/ai/creative/elaborate-idea', { query: idea });
      
      if (res.data.success && res.data.data) {
        setAiData(res.data.data);
        toast.dismiss();
        toast.success('Story concept developed!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      toast.dismiss();
      const errorMsg = error.response?.data?.detail || 'The AI writer is taking a break.';
      toast.error(errorMsg);
      setAiData({ error: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Render character cards
  const renderCharacters = (characters) => {
    if (!characters || !Array.isArray(characters)) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className="p-6 rounded-xl bg-surface/80 border border-border hover:border-primary/30 transition-all duration-300 h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-display text-text-main">{character.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                character.role === 'Protagonist' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : character.role === 'Antagonist'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}>
                {character.role}
              </span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-primary font-semibold mb-1">Character Arc</p>
                <p className="text-text-secondary leading-relaxed">{character.arc}</p>
              </div>
              <div>
                <p className="text-primary font-semibold mb-1">Motivation</p>
                <p className="text-text-secondary">{character.motivation}</p>
              </div>
              <div>
                <p className="text-primary font-semibold mb-1">Flaws & Weaknesses</p>
                <p className="text-text-secondary">{character.flaws}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Render plot structure
  const renderPlotStructure = (plot) => {
    if (!plot) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="p-6 rounded-xl bg-surface/80 border border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 font-bold">1</span>
            </div>
            <h3 className="text-lg font-display text-green-400">Act I: Setup</h3>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">{plot.act1_setup}</p>
        </motion.div>

        <motion.div variants={fadeInUp} className="p-6 rounded-xl bg-surface/80 border border-yellow-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span className="text-yellow-400 font-bold">2</span>
            </div>
            <h3 className="text-lg font-display text-yellow-400">Act II: Confrontation</h3>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">{plot.act2_confrontation}</p>
        </motion.div>

        <motion.div variants={fadeInUp} className="p-6 rounded-xl bg-surface/80 border border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-red-400 font-bold">3</span>
            </div>
            <h3 className="text-lg font-display text-red-400">Act III: Resolution</h3>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">{plot.act3_resolution}</p>
        </motion.div>
      </div>
    );
  };

  // Render key scenes
  const renderKeyScenes = (scenes) => {
    if (!scenes || !Array.isArray(scenes)) return null;

    return (
      <div className="space-y-4">
        {scenes.map((scene, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className="p-6 rounded-xl bg-surface/80 border border-border hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{index + 1}</span>
                </div>
                <h3 className="text-lg font-display text-text-main">{scene.scene_name}</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-primary font-semibold mb-1">Purpose</p>
                <p className="text-text-secondary">{scene.purpose}</p>
              </div>
              <div>
                <p className="text-primary font-semibold mb-1">Emotional Beat</p>
                <p className="text-text-secondary">{scene.emotional_beat}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

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
            ELABORATE IDEA
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Transform your simple concept into a rich story foundation with characters, plot structure, themes, and detailed scenes.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="mb-12">
          <div>
            <label htmlFor="idea" className="block text-lg font-display text-text-main mb-3">
              Your Core Idea
            </label>
            <textarea
              ref={textareaRef}
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Enter your core story idea or concept (e.g., 'A time traveler who accidentally changes history', 'A detective who can speak to ghosts', 'A chef who discovers magical ingredients')..."
              className="w-full p-6 rounded-2xl border-2 border-border bg-surface text-text-main focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-300 min-h-[150px] text-lg leading-relaxed"
              required
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!idea.trim()}
            className="mt-6 w-full py-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-lg font-semibold shadow-xl transition-all duration-300 rounded-2xl"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <Zap className="animate-spin" /> Developing Story...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Brain /> Elaborate Idea
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
                <h3 className="text-2xl font-display text-red-400 mb-4">STORY DEVELOPMENT FAILED</h3>
                <p className="text-text-secondary text-lg">{aiData.error}</p>
              </div>
            ) : (
              <>
                {/* Core Concept */}
                <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-primary/20 shadow-2xl">
                  <h2 className="text-3xl font-display text-primary mb-4 flex items-center gap-3">
                    <Sparkles className="w-8 h-8" />
                    Core Concept
                  </h2>
                  <p className="text-text-main text-lg leading-relaxed italic border-l-4 border-primary pl-4">
                    "{aiData.core_concept}"
                  </p>
                </motion.div>

                {/* Expanded Premise */}
                <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-border shadow-xl">
                  <h2 className="text-3xl font-display text-primary mb-6 flex items-center gap-3">
                    <BookOpen className="w-8 h-8" />
                    Expanded Story Premise
                  </h2>
                  <p className="text-text-main text-lg leading-relaxed">{aiData.expanded_premise}</p>
                </motion.div>

                {/* Main Characters */}
                {aiData.main_characters && aiData.main_characters.length > 0 && (
                  <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-border shadow-xl">
                    <h2 className="text-3xl font-display text-primary mb-6 flex items-center gap-3">
                      <Users className="w-8 h-8" />
                      Main Characters
                    </h2>
                    {renderCharacters(aiData.main_characters)}
                  </motion.div>
                )}

                {/* Plot Structure */}
                {aiData.plot_structure && (
                  <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-border shadow-xl">
                    <h2 className="text-3xl font-display text-primary mb-6 flex items-center gap-3">
                      <Target className="w-8 h-8" />
                      Plot Structure
                    </h2>
                    {renderPlotStructure(aiData.plot_structure)}
                  </motion.div>
                )}

                {/* Themes */}
                {aiData.themes && aiData.themes.length > 0 && (
                  <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-border shadow-xl">
                    <h2 className="text-3xl font-display text-primary mb-6 flex items-center gap-3">
                      <Heart className="w-8 h-8" />
                      Themes & Motifs
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {aiData.themes.map((theme, index) => (
                        <span key={index} className="px-4 py-2 bg-primary/20 text-primary rounded-full border border-primary/30 text-sm font-medium">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Key Scenes */}
                {aiData.key_scenes && aiData.key_scenes.length > 0 && (
                  <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-border shadow-xl">
                    <h2 className="text-3xl font-display text-primary mb-6 flex items-center gap-3">
                      <FileText className="w-8 h-8" />
                      Key Scenes
                    </h2>
                    {renderKeyScenes(aiData.key_scenes)}
                  </motion.div>
                )}

                {/* Development Questions */}
                {aiData.development_questions && aiData.development_questions.length > 0 && (
                  <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-blue-500/20 shadow-xl">
                    <h2 className="text-3xl font-display text-blue-400 mb-6">Further Development Questions</h2>
                    <div className="space-y-3">
                      {aiData.development_questions.map((question, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <span className="text-blue-400 font-bold mt-1">?</span>
                          <p className="text-text-main">{question}</p>
                        </div>
                      ))}
                    </div>
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
              <Brain className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-display text-text-main mb-2">Ready to Build Your Story</h3>
              <p className="text-text-secondary">
                Enter your core idea above to get AI-powered story development with characters, plot structure, 
                themes, and key scenes.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
};

export default ElaborateIdeaPage;