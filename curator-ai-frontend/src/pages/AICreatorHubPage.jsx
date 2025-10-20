// src/pages/AICreatorHubPage.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, HelpCircle, Camera, Sparkles } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';

const ToolCard = ({ to, icon: Icon, title, description, comingSoon = false }) => (
  <Link to={comingSoon ? '#' : to} className={comingSoon ? 'cursor-not-allowed' : ''}>
    <motion.div
      variants={fadeInUp}
      className={`group p-8 rounded-xl bg-surface border border-border transition-all duration-300 transform h-full min-h-[320px] flex flex-col justify-between
        ${comingSoon 
          ? 'opacity-60' 
          : 'hover:border-primary/50 hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-xl'
        }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <Icon className={`w-12 h-12 ${comingSoon ? 'text-text-tertiary' : 'text-primary'} transition-transform duration-300 ${comingSoon ? '' : 'group-hover:scale-110'}`} />
          {comingSoon && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-mono rounded border border-yellow-500/30">
              SOON
            </span>
          )}
        </div>
        <h3 className="text-2xl font-display text-text-main mb-2">{title}</h3>
        <p className="text-text-secondary leading-relaxed">{description}</p>
      </div>
      <div className="mt-6">
        <span className={`text-sm font-medium ${comingSoon ? 'text-text-tertiary' : 'text-primary group-hover:underline'}`}>
          {comingSoon ? 'Coming Soon' : 'Explore →'}
        </span>
      </div>
    </motion.div>
  </Link>
);

const AICreatorHubPage = () => {
  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="max-w-6xl mx-auto p-8 min-h-screen"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="text-center mb-16">
        <div className="inline-block mb-4">
          <span className="px-4 py-2 bg-primary/20 text-primary text-sm font-mono rounded-full border border-primary/30 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI CREATIVE STUDIO
          </span>
        </div>
        <h1
          className="mb-4 text-6xl font-display text-text-main tracking-tight uppercase"
          style={{ textShadow: '0 0 30px rgba(162, 89, 255, 0.6)' }}
        >
          CREATIVE STUDIO
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Your AI partner for cinematic creation. Brainstorm ideas, develop stories, and plan shots with intelligent assistance.
        </p>
      </motion.div>

      {/* Tool Selection Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch"
      >
        <ToolCard
          to="/ai-creator/elaborate"
          icon={Brain}
          title="Elaborate Idea"
          description="Transform simple concepts into rich story foundations with characters, plot points, and themes."
        />
        <ToolCard
          to="/ai-creator/brainstorm"
          icon={HelpCircle}
          title="Brainstorm Elements"
          description="Generate creative ideas for plot twists, characters, settings, and genre-specific elements."
        />
        <ToolCard
          to="/ai-creator/plan-shots"
          icon={Camera}
          title="Plan Shots"
          description="Get camera shot suggestions, angles, and cinematography advice for your scenes."
        />
      </motion.div>

      {/* Stats/Info Section */}
      <motion.div variants={fadeInUp} className="mt-16 text-center">
        <div className="inline-grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-surface/50 rounded-2xl border border-border">
          <div>
            <div className="text-3xl font-display text-primary mb-2">3+</div>
            <div className="text-text-secondary">Creative Tools</div>
          </div>
          <div>
            <div className="text-3xl font-display text-primary mb-2">AI-Powered</div>
            <div className="text-text-secondary">Smart Assistance</div>
          </div>
          <div>
            <div className="text-3xl font-display text-primary mb-2">Instant</div>
            <div className="text-text-secondary">Real-time Results</div>
          </div>
        </div>
      </motion.div>
    </motion.main>
  );
};

export default AICreatorHubPage;
