import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { MessageCircle, Zap, Sparkles, Brain, Video, Lightbulb } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../../animations/variants';

const AIAssistantPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [aiData, setAiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
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
      toast.error('Please enter your creative question or request.');
      return;
    }

    setIsLoading(true);
    setAiData(null);
    toast.loading('Routing to the best creative assistant...');

    try {
      const res = await api.post('/api/ai/creative/assist', {
        user_id: String(user._id),
        query,
      });
      
      if (res.data.success && res.data.data) {
        setAiData(res.data.data);
        
        // Add to conversation history
        setConversationHistory(prev => [
          ...prev,
          {
            query,
            response: res.data.data,
            agent_type: res.data.agent_type,
            timestamp: new Date().toISOString()
          }
        ]);
        
        toast.dismiss();
        toast.success(`Handled by ${res.data.agent_type.replace('_', ' ')} agent!`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      toast.dismiss();
      const errorMsg = error.response?.data?.detail || 'Failed to process your request. Please try again.';
      toast.error(errorMsg);
      setAiData({ error: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentIcon = (agentType) => {
    switch (agentType) {
      case 'brainstorm_ideas':
        return Lightbulb;
      case 'shorts_content':
        return Video;
      case 'movie_recommendation':
        return Sparkles;
      default:
        return Brain;
    }
  };

  const getAgentColor = (agentType) => {
    switch (agentType) {
      case 'brainstorm_ideas':
        return 'text-yellow-400';
      case 'shorts_content':
        return 'text-blue-400';
      case 'movie_recommendation':
        return 'text-purple-400';
      default:
        return 'text-primary';
    }
  };

  const getAgentLabel = (agentType) => {
    switch (agentType) {
      case 'brainstorm_ideas':
        return 'Brainstorm Ideas';
      case 'shorts_content':
        return 'Shorts Content';
      case 'movie_recommendation':
        return 'Movie Recommendation';
      default:
        return 'Creative Assistant';
    }
  };

  const renderResponse = (data, agentType) => {
    if (!data) return null;

    if (data.error) {
      return (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400">{data.error}</p>
        </div>
      );
    }

    switch (agentType) {
      case 'brainstorm_ideas':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-display text-text-main mb-4">Content Ideas</h3>
            {data.ideas?.map((idea, index) => (
              <div key={index} className="p-4 rounded-lg bg-surface/60 border border-border">
                <h4 className="font-semibold text-primary mb-2">{idea.title}</h4>
                <p className="text-text-secondary text-sm">{idea.concept}</p>
              </div>
            ))}
          </div>
        );

      case 'shorts_content':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-display text-text-main mb-4">Shorts Content</h3>
            {data.video_script && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <strong className="text-green-400 text-sm">Hook:</strong>
                  <p className="text-text-main text-sm mt-1">{data.video_script.hook}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <strong className="text-blue-400 text-sm">Content:</strong>
                  <p className="text-text-main text-sm mt-1">{data.video_script.main_content}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'movie_recommendation':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-display text-text-main mb-4">Movie Recommendations</h3>
            {data.recommendations?.map((rec, index) => (
              <div key={index} className="p-4 rounded-lg bg-surface/60 border border-border">
                <h4 className="font-semibold text-primary">{rec.title}</h4>
                <p className="text-text-secondary text-sm mt-1">{rec.match_reason}</p>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="p-4 rounded-lg bg-surface/60 border border-border">
            <p className="text-text-main">{JSON.stringify(data, null, 2)}</p>
          </div>
        );
    }
  };

  return (
    <motion.main 
      initial="hidden" 
      animate="visible" 
      variants={fadeIn} 
      className="min-h-screen bg-background py-12"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h1 className="mb-4 text-6xl font-display text-text-main tracking-tight uppercase">
            AI ASSISTANT
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Ask anything creative! Our AI will automatically route your query to the best tool - whether you need content ideas, shorts scripts, or movie recommendations.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="mb-8">
          <div>
            <label htmlFor="query" className="block text-lg font-display text-text-main mb-3">
              What do you need help with?
            </label>
            <textarea
              ref={textareaRef}
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything creative... (e.g., 'I need ideas for science content on TikTok', 'Create a shorts script about time travel', 'Recommend movies like Inception')"
              className="w-full p-6 rounded-2xl border-2 border-border bg-surface text-text-main focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-300 min-h-[120px] text-lg leading-relaxed"
              required
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!query.trim()}
            className="mt-6 w-full py-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-lg font-semibold shadow-xl transition-all duration-300 rounded-2xl"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <Zap className="animate-spin" /> Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <MessageCircle /> Ask AI Assistant
              </span>
            )}
          </Button>
        </motion.form>

        {/* Current Response */}
        {aiData && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-8"
          >
            <div className="p-6 rounded-2xl bg-surface border border-primary/20 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                {aiData.agent_type && (
                  <>
                    {React.createElement(getAgentIcon(aiData.agent_type), {
                      className: `w-6 h-6 ${getAgentColor(aiData.agent_type)}`
                    })}
                    <span className={`font-semibold ${getAgentColor(aiData.agent_type)}`}>
                      {getAgentLabel(aiData.agent_type)}
                    </span>
                  </>
                )}
              </div>
              {renderResponse(aiData, aiData.agent_type)}
            </div>
          </motion.div>
        )}

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <motion.div variants={fadeInUp} className="space-y-4">
            <h3 className="text-xl font-display text-text-main mb-4">Conversation History</h3>
            {conversationHistory.slice().reverse().map((conv, index) => (
              <div key={index} className="p-4 rounded-xl bg-surface/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  {React.createElement(getAgentIcon(conv.agent_type), {
                    className: `w-4 h-4 ${getAgentColor(conv.agent_type)}`
                  })}
                  <span className={`text-xs font-medium ${getAgentColor(conv.agent_type)}`}>
                    {getAgentLabel(conv.agent_type)}
                  </span>
                  <span className="text-text-tertiary text-xs">
                    {new Date(conv.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-2">
                  <strong>You:</strong> {conv.query}
                </p>
                <div className="text-text-main text-sm">
                  {renderResponse(conv.response, conv.agent_type)}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Empty State Instructions */}
        {!aiData && !isLoading && conversationHistory.length === 0 && (
          <motion.div variants={fadeInUp} className="text-center py-12">
            <div className="max-w-md mx-auto">
              <MessageCircle className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-display text-text-main mb-2">Ask Me Anything Creative</h3>
              <p className="text-text-secondary mb-6">
                I can help you with content ideas, shorts scripts, movie recommendations, and more!
              </p>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-surface/50 border border-border">
                  <strong className="text-primary">Try These Examples</strong>
                  <div className="text-text-secondary mt-2 space-y-1">
                    <div>• "Brainstorm ideas for a cooking channel"</div>
                    <div>• "Create a 30-second reel about AI"</div>
                    <div>• "Recommend mind-bending movies"</div>
                    <div>• "Help me plan content for my travel blog"</div>
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

export default AIAssistantPage;