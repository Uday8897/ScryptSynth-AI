import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Camera, Film, Zap, Lightbulb, Video, Settings } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../../animations/variants';

const PlanShotsPage = () => {
  const [sceneDescription, setSceneDescription] = useState('');
  const [desiredMood, setDesiredMood] = useState('');
  const [aiData, setAiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [sceneDescription]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sceneDescription.trim()) {
      toast.error('Please describe the scene.');
      return;
    }

    setIsLoading(true);
    setAiData(null);
    toast.loading('Planning the perfect shots...');

    try {
      // Combine scene description and desired mood into a single query
      const queryText = desiredMood 
        ? `Scene: ${sceneDescription}\nDesired Mood: ${desiredMood}` 
        : sceneDescription;

      const res = await api.post('/api/ai/creative/plan-shots', { query: queryText });
      
      if (res.data.success && res.data.data) {
        setAiData(res.data.data);
        toast.dismiss();
        toast.success('Shot list generated!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      toast.dismiss();
      const errorMsg = error.response?.data?.detail || 'The AI cinematographer is unavailable.';
      toast.error(errorMsg);
      setAiData({ error: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Render shot sequence in a beautiful format
  const renderShotSequence = (shots) => {
    if (!shots || !Array.isArray(shots)) return null;

    return (
      <div className="space-y-4">
        {shots.map((shot, index) => (
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
                <div>
                  <h3 className="text-lg font-display text-text-main">{shot.shot_type}</h3>
                  <p className="text-text-secondary text-sm">{shot.camera_angle}</p>
                </div>
              </div>
              {shot.lens_suggestion && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30">
                  {shot.lens_suggestion}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-primary font-semibold mb-1">Purpose</p>
                <p className="text-text-secondary">{shot.purpose}</p>
              </div>
              {shot.movement && (
                <div>
                  <p className="text-primary font-semibold mb-1">Movement</p>
                  <p className="text-text-secondary">{shot.movement}</p>
                </div>
              )}
              {shot.lighting_notes && (
                <div className="md:col-span-2">
                  <p className="text-primary font-semibold mb-1 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Lighting Notes
                  </p>
                  <p className="text-text-secondary">{shot.lighting_notes}</p>
                </div>
              )}
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
            PLAN SHOTS
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Transform your written scene into a visual masterpiece. Get AI-powered suggestions for camera angles, 
            movements, and cinematography techniques.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="mb-12">
          <div className="space-y-6">
            <div>
              <label htmlFor="sceneDescription" className="block text-lg font-display text-text-main mb-3">
                Scene Description
              </label>
              <textarea
                ref={textareaRef}
                id="sceneDescription"
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                placeholder="Describe your scene in detail... (e.g., 'A tense confrontation in a dark alley between a detective and a serial killer. Rain is pouring, creating reflections on the wet pavement.')"
                className="w-full p-6 rounded-2xl border-2 border-border bg-surface text-text-main focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-300 min-h-[150px] text-lg leading-relaxed"
                required
              />
            </div>
            
            <div>
              <label htmlFor="desiredMood" className="block text-lg font-display text-text-main mb-3">
                Desired Mood <span className="text-text-tertiary text-sm">(Optional)</span>
              </label>
              <Input
                id="desiredMood"
                type="text"
                placeholder="e.g., Tense, Romantic, Mysterious, Epic, Intimate, Suspenseful"
                value={desiredMood}
                onChange={(e) => setDesiredMood(e.target.value)}
                className="text-lg p-4 rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!sceneDescription.trim()}
            className="mt-8 w-full py-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-lg font-semibold shadow-xl transition-all duration-300 rounded-2xl"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <Zap className="animate-spin" /> Planning Shots...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Camera /> Generate Shot List
              </span>
            )}
          </Button>
        </motion.form>

        {/* AI Response Display */}
        {aiData && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="space-y-8"
          >
            {/* Error State */}
            {aiData.error ? (
              <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
                <h3 className="text-2xl font-display text-red-400 mb-4">SHOT PLANNING FAILED</h3>
                <p className="text-text-secondary text-lg">{aiData.error}</p>
              </div>
            ) : (
              <>
                {/* Scene Mood & Overview */}
                <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-primary/20 shadow-2xl">
                  <h2 className="text-3xl font-display text-primary mb-6 flex items-center gap-3">
                    <Film className="w-8 h-8" />
                    Scene Analysis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-display text-text-main mb-2">Detected Mood</h3>
                      <span className="px-4 py-2 bg-primary/20 text-primary rounded-full border border-primary/30 text-sm font-medium">
                        {aiData.scene_mood || 'Not specified'}
                      </span>
                    </div>
                    {aiData.overall_directorial_advice && (
                      <div>
                        <h3 className="text-lg font-display text-text-main mb-2">Directorial Advice</h3>
                        <p className="text-text-secondary leading-relaxed">{aiData.overall_directorial_advice}</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Shot Sequence */}
                <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-border shadow-xl">
                  <h2 className="text-3xl font-display text-primary mb-6 flex items-center gap-3">
                    <Video className="w-8 h-8" />
                    Shot Sequence
                  </h2>
                  {renderShotSequence(aiData.shot_sequence)}
                </motion.div>

                {/* Equipment Suggestions */}
                {aiData.equipment_suggestions && aiData.equipment_suggestions.length > 0 && (
                  <motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-surface border border-border shadow-xl">
                    <h2 className="text-3xl font-display text-primary mb-6 flex items-center gap-3">
                      <Settings className="w-8 h-8" />
                      Equipment Suggestions
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {aiData.equipment_suggestions.map((equipment, index) => (
                        <span key={index} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 text-sm font-medium">
                          {equipment}
                        </span>
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
              <Camera className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-display text-text-main mb-2">Ready to Plan Your Shots</h3>
              <p className="text-text-secondary">
                Describe your scene above to get AI-powered cinematography suggestions, including camera angles, 
                movements, and lighting recommendations.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
};

export default PlanShotsPage;