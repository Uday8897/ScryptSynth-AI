// src/pages/AICreatorHubPage.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Video, MessageCircle, Sparkles, Zap, TrendingUp, PenTool } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';

const ToolCard = ({ to, icon: Icon, title, description, gradient, examples }) => (
  <Link to={to}>
    <motion.div
      variants={fadeInUp}
      className="group p-8 rounded-2xl bg-surface border border-border transition-all duration-500 transform h-full min-h-[380px] flex flex-col justify-between relative overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-3"
    >
      {/* Gradient Background Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`} />
      
      {/* Animated Border Glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute inset-0 rounded-2xl ${gradient.replace('bg-', 'border-')} border-2`} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-3 rounded-xl ${gradient} bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300`}>
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-text-main">{title}</h3>
        </div>
        
        <p className="text-text-secondary leading-relaxed text-lg mb-6">
          {description}
        </p>

        {/* Example Prompts */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text-main uppercase tracking-wider">Try These:</h4>
          {examples.map((example, index) => (
            <div key={index} className="p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-sm text-text-secondary italic">"{example}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-6">
        <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300">
          Start Creating
          <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </span>
      </div>
    </motion.div>
  </Link>
);

const AICreatorHubPage = () => {
  const creativeTools = [
    {
      to: "/ai-creator/idea-generator",
      icon: Brain,
      title: "Idea Generator",
      description: "Brainstorm viral content ideas, trending concepts, and creative angles for your social media platforms. Get AI-powered inspiration for your next big hit.",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
      examples: [
        "Science explainer content for TikTok",
        "Movie review channel ideas",
        "Viral comedy sketch concepts"
      ]
    },
    {
      to: "/ai-creator/shorts-script",
      icon: Video,
      title: "Shorts Script Writer",
      description: "Create complete scripts for short-form videos. Perfect for Instagram Reels, YouTube Shorts, and TikTok with hooks, body content, and CTAs.",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
      examples: [
        "30-second time travel paradox explainer",
        "Quick movie review for new releases",
        "Educational content about space"
      ]
    },
    {
      to: "/ai-creator/caption-optimizer",
      icon: PenTool,
      title: "Caption Optimizer",
      description: "Generate scroll-stopping captions and hooks for your social media posts. Multiple tone options to match your brand voice.",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
      examples: [
        "Catchy captions for travel photos",
        "Engaging hooks for movie discussions",
        "Funny captions for behind-the-scenes"
      ]
    }
  ];

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="max-w-7xl mx-auto px-4 py-12 min-h-screen"
    >
      {/* Hero Section */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center mb-20">
        <motion.div variants={fadeInUp} className="inline-block mb-6">
          <span className="px-6 py-3 bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary text-base font-semibold rounded-full border border-primary/30 flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            AI CONTENT CREATION STUDIO
            <Sparkles className="w-5 h-5" />
          </span>
        </motion.div>
        
        <motion.h1 
          variants={fadeInUp}
          className="mb-6 text-7xl font-bold text-text-main tracking-tight"
        >
          Creative
          <span className="block bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Studio
          </span>
        </motion.h1>
        
        <motion.p 
          variants={fadeInUp}
          className="text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-8"
        >
          Transform your creative process with AI-powered tools for content creation, 
          script writing, and social media optimization.
        </motion.p>

        {/* Stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">3</div>
            <div className="text-text-secondary">Specialized Tools</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">AI</div>
            <div className="text-text-secondary">Powered Creation</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">Instant</div>
            <div className="text-text-secondary">Real-time Results</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Tools Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20"
      >
        {creativeTools.map((tool, index) => (
          <ToolCard key={index} {...tool} />
        ))}
      </motion.div>

      {/* How It Works */}
      <motion.div variants={fadeInUp} className="text-center mb-20">
        <h2 className="text-4xl font-bold text-text-main mb-4">How It Works</h2>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12">
          Three simple steps to transform your ideas into engaging content
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-main mb-3">1. Describe Your Idea</h3>
            <p className="text-text-secondary">
              Tell our AI what kind of content you want to create or what problem you're trying to solve.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-main mb-3">2. AI Generates Content</h3>
            <p className="text-text-secondary">
              Our specialized AI tools create tailored content based on your specific needs and goals.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-main mb-3">3. Refine & Use</h3>
            <p className="text-text-secondary">
              Review the generated content, make adjustments, and implement it across your platforms.
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div variants={fadeInUp} className="text-center">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-3xl font-bold text-text-main mb-4">
            Ready to Create Amazing Content?
          </h2>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Choose one of our specialized AI tools above and start creating engaging, 
            platform-optimized content in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/ai-creator/idea-generator"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Start with Idea Generator
            </Link>
            <Link
              to="/ai-creator/shorts-script"
              className="border-2 border-primary text-primary hover:bg-primary/10 font-semibold py-4 px-8 rounded-xl transition-all duration-300"
            >
              Try Script Writer
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.main>
  );
};

export default AICreatorHubPage;