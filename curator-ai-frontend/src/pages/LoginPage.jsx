import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Clapperboard, Film, Zap, Eye, EyeOff } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    toast.loading('Signing in...');
    try {
      const response = await api.post('/auth/login', { username, password });
      const { accessToken, displayName, userId } = response.data;

      login(accessToken, { id: userId, displayName });

      toast.dismiss();
      toast.success(`Welcome back, ${displayName}!`);
      navigate('/');
    } catch (error) {
      toast.dismiss();
      toast.error('Invalid username or password');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background"></div>

      {/* Floating Glows */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full max-w-md"
        >
          <motion.form
            onSubmit={handleSubmit}
            variants={staggerContainer}
            className="p-10 rounded-2xl border border-border bg-surface/80 backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden"
          >
            {/* Subtle background movement */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            />

            <div className="relative z-10">
              {/* Header */}
              <motion.div variants={fadeInUp} className="text-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-2xl mb-6"
                >
                  <Clapperboard size={32} className="text-white" />
                </motion.div>
                <h1
                  className="text-5xl font-display text-text-main tracking-tight mb-2"
                  style={{ textShadow: '0 0 20px rgba(162, 89, 255, 0.5)' }}
                >
                  ScryptSynth AI
                </h1>
                <p className="text-text-secondary text-lg">
                  Your AI content creation studio
                </p>
              </motion.div>

              {/* Input Fields */}
              <motion.div variants={fadeInUp} className="space-y-6">
                <div>
                  <label className="block text-text-main font-semibold mb-3 text-sm uppercase tracking-wide">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-4 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 text-lg"
                    icon={<Film size={20} className="text-text-secondary" />}
                  />
                </div>

                <div>
                  <label className="block text-text-main font-semibold mb-3 text-sm uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-4 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 text-lg pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Login Button */}
              <motion.div variants={fadeInUp} className="mt-8">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={!username.trim() || !password.trim()}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transform hover:scale-105 transition-all duration-300 shadow-2xl border-0"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Zap size={20} />
                      </motion.div>
                      <span className="ml-2">Signing in...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Zap size={20} className="mr-2" />
                      Sign In
                    </span>
                  )}
                </Button>
              </motion.div>

              {/* Register Link */}
              <motion.div variants={fadeInUp} className="text-center mt-6 pt-6 border-t border-border">
                <p className="text-text-secondary">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-primary hover:text-accent transition-colors duration-300 underline"
                  >
                    Create Account
                  </Link>
                </p>
              </motion.div>
            </div>
          </motion.form>

          {/* Footer */}
          <motion.div variants={fadeInUp} className="text-center mt-8">
            <p className="text-text-secondary text-sm">
              AI-powered content creation platform
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;