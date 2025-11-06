import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
// import { useAuth } from '../../../hooks/useAuth';
import { useAuth } from '../../hooks/useAuth';

import api from '../../api';
import toast from 'react-hot-toast';
import { PenTool, Zap, Copy, LoaderCircle, MessageCircle } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../../animations/variants';
import Button from '../../components/common/Button';

const CaptionOptimizerPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);
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
      toast.error('Please log in and enter your caption request.');
      return;
    }

    setIsLoading(true);
    setOptions([]);
    toast.loading('Generating engaging captions...');

    try {
     // Use the direct endpoint
const res = await api.post('/api/ai/agent/caption-optimizer', {
  user_id: String(userId),
  query: query,
});

      const response = res.data;
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.agent_type === 'caption_optimizer' && response.options) {
        setOptions(response.options);
        toast.dismiss();
        toast.success(`Generated ${response.options.length} caption options!`);
      } else {
        throw new Error('Unexpected response format');
      }

    } catch (error) {
      toast.dismiss();
      console.error('Caption generation error:', error);
      let errorMsg = error.response?.data?.detail || error.message || "Failed to generate captions.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getToneColor = (tone) => {
    const colors = {
      funny: 'bg-yellow-500/20 text-yellow-400',
      inspirational: 'bg-purple-500/20 text-purple-400',
      professional: 'bg-blue-500/20 text-blue-400',
      casual: 'bg-green-500/20 text-green-400',
      dramatic: 'bg-red-500/20 text-red-400',
      mysterious: 'bg-indigo-500/20 text-indigo-400'
    };
    return colors[tone] || 'bg-primary/20 text-primary';
  };

  const examplePrompts = [
    "Captions for travel photos from my Japan trip",
    "Engaging hooks for movie discussion posts",
    "Funny captions for behind-the-scenes content",
    "Inspirational quotes for fitness journey",
    "Professional captions for business announcements"
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
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
              <PenTool className="w-8 h-8 text-white" />
            </div>
            <span className="px-4 py-2 bg-primary/20 text-primary text-sm font-semibold rounded-full border border-primary/30">
              CAPTION OPTIMIZER
            </span>
          </div>
          <h1 className="text-5xl font-bold text-text-main mb-4">
            Create Scroll-Stopping Captions
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Generate engaging hooks and captions for your social media posts with multiple tone options.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="mb-12">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you need captions for... (e.g., 'Captions for travel photos from my Japan trip')"
            className="w-full p-6 rounded-2xl border-2 border-border bg-surface text-text-main focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 resize-none transition-all duration-300 min-h-[120px] text-lg"
            rows={3}
          />
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!query.trim() || !getUserId()}
            className="mt-6 w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <LoaderCircle className="animate-spin" />
                Generating Captions...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <MessageCircle />
                Generate Captions
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
        {options.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-text-main text-center mb-8">
              Your Caption Options
            </h2>
            
            {options.map((option, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-surface/50 rounded-2xl border border-border p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-xl font-semibold text-text-main">{option.title}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getToneColor(option.tone)}`}>
                    {option.tone}
                  </span>
                </div>
                
                <p className="text-text-secondary leading-relaxed text-lg mb-4 bg-background/50 p-4 rounded-xl">
                  {option.caption}
                </p>
                
                <div className="flex items-center justify-between">
                  {option.hashtags && option.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {option.hashtags.slice(0, 5).map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => copyToClipboard(`${option.caption}\n\n${option.hashtags?.map(tag => `#${tag}`).join(' ')}`)}
                    className="flex items-center gap-2 px-3 py-1 hover:bg-surface rounded-lg transition-colors text-text-secondary hover:text-text-main"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results State */}
        {!isLoading && options.length === 0 && query && (
          <motion.div variants={fadeInUp} className="text-center py-12">
            <PenTool className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-main mb-2">No Captions Generated</h3>
            <p className="text-text-secondary">
              Try refining your query or use one of the example prompts above.
            </p>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
};

export default CaptionOptimizerPage;