import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
// import { useAuth } from '../../../hooks/useAuth';
import { useAuth } from '../../hooks/useAuth';

// import api from '../../../api';
import api from '../../api';

import toast from 'react-hot-toast';
import { Video, Zap, Play, Copy, LoaderCircle, Clock } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../../animations/variants';
import Button from '../../components/common/Button';

const ShortsScriptPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState(null);
  const textareaRef = useRef(null);

  const getUserId = () => user?.id || user?._id;

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
      toast.error('Please log in and enter your script request.');
      return;
    }

    setIsLoading(true);
    setScript(null);
    toast.loading('Creating your short-form script...');

    try {
  // Use the direct endpoint
const res = await api.post('/api/ai/agent/shorts-script', {
  user_id: String(userId),
  query: query,
});

      const response = res.data;
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.agent_type === 'shorts_script' && response.script) {
        setScript(response.script);
        toast.dismiss();
        toast.success('Script created successfully!');
      } else {
        throw new Error('Unexpected response format');
      }

    } catch (error) {
      toast.dismiss();
      console.error('Script generation error:', error);
      let errorMsg = error.response?.data?.detail || error.message || "Failed to generate script.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const examplePrompts = [
    "30-second explainer about time travel paradoxes",
    "Quick movie review of the latest blockbuster",
    "Educational short about black holes for TikTok",
    "Funny sketch about morning routines",
    "Motivational fitness tip for Instagram Reels"
  ];

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen bg-background py-12"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
              <Video className="w-8 h-8 text-white" />
            </div>
            <span className="px-4 py-2 bg-primary/20 text-primary text-sm font-semibold rounded-full border border-primary/30">
              SHORTS SCRIPT WRITER
            </span>
          </div>
          <h1 className="text-5xl font-bold text-text-main mb-4">
            Create Short-Form Scripts
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Generate complete scripts for Instagram Reels, YouTube Shorts, and TikTok with engaging hooks and clear structure.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="mb-12">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your short-form video concept... (e.g., '30-second explainer about time travel paradoxes')"
            className="w-full p-6 rounded-2xl border-2 border-border bg-surface text-text-main focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 resize-none transition-all duration-300 min-h-[120px] text-lg"
            rows={3}
          />
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!query.trim() || !getUserId()}
            className="mt-6 w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <LoaderCircle className="animate-spin" />
                Creating Script...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Play />
                Generate Script
              </span>
            )}
          </Button>
        </motion.form>

        {/* Example Prompts */}
        <motion.div variants={fadeInUp} className="mb-12">
          <h3 className="text-xl font-semibold text-text-main mb-4">Try These Examples:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setQuery(prompt)}
                className="p-4 text-left rounded-xl bg-surface/50 border border-border hover:border-primary/50 hover:bg-surface transition-all duration-300"
              >
                <p className="text-text-secondary text-sm italic">"{prompt}"</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        {script && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-text-main mb-2">
                Your Short-Form Script
              </h2>
              <div className="flex items-center justify-center gap-4 text-text-secondary">
                <Clock className="w-5 h-5" />
                <span>{script.estimated_duration}</span>
              </div>
            </div>

            <div className="bg-surface/50 rounded-2xl border border-border overflow-hidden">
              {/* Script Sections */}
              <div className="p-8 space-y-6">
                {/* Hook */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-xl font-semibold text-text-main">Hook</h3>
                  </div>
                  <p className="text-text-secondary leading-relaxed text-lg bg-background/50 p-4 rounded-xl">
                    {script.hook}
                  </p>
                </div>

                {/* Body */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Video className="w-5 h-5 text-blue-500" />
                    <h3 className="text-xl font-semibold text-text-main">Content</h3>
                  </div>
                  <p className="text-text-secondary leading-relaxed text-lg bg-background/50 p-4 rounded-xl whitespace-pre-line">
                    {script.body}
                  </p>
                </div>

                {/* Call to Action */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Play className="w-5 h-5 text-green-500" />
                    <h3 className="text-xl font-semibold text-text-main">Call to Action</h3>
                  </div>
                  <p className="text-text-secondary leading-relaxed text-lg bg-background/50 p-4 rounded-xl">
                    {script.cta}
                  </p>
                </div>
              </div>

              {/* Hashtags & Actions */}
              <div className="bg-surface border-t border-border p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {script.hashtags?.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(`${script.hook}\n\n${script.body}\n\n${script.cta}\n\n${script.hashtags?.map(tag => `#${tag}`).join(' ')}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Full Script
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(script.hashtags?.map(tag => `#${tag}`).join(' '))}
                    className="flex items-center gap-2 px-4 py-2 border border-border text-text-main rounded-lg hover:bg-surface transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Hashtags
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* No Results State */}
        {!isLoading && !script && query && (
          <motion.div variants={fadeInUp} className="text-center py-12">
            <Video className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-main mb-2">No Script Generated</h3>
            <p className="text-text-secondary">
              Try refining your query or use one of the example prompts above.
            </p>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
};

export default ShortsScriptPage;