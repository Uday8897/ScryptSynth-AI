import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Clapperboard, Film, Star, Zap, User, Mail, Eye, EyeOff } from 'lucide-react';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    toast.loading('Creating account...');
    try {
      await api.post('/auth/register', { username, email, password });
      toast.dismiss();
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error) {
      toast.dismiss();
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background"></div>
      <motion.div
        className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
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
            {/* Background Glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10"
              animate={{
                backgroundPosition: ['100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />

            <div className="relative z-10">
              {/* Header */}
              <motion.div variants={fadeInUp} className="text-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-2xl mb-6"
                >
                  <Clapperboard size={32} className="text-white" />
                </motion.div>
                <h1 className="text-5xl font-display text-text-main tracking-tight mb-2" 
                    style={{ textShadow: '0 0 20px rgba(162, 89, 255, 0.5)' }}>
                  ScryptSynth AI
                </h1>
                <p className="text-text-secondary text-lg">Create your account</p>
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
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-4 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 text-lg"
                    icon={<User size={20} className="text-text-secondary" />}
                  />
                </div>

                <div>
                  <label className="block text-text-main font-semibold mb-3 text-sm uppercase tracking-wide">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 text-lg"
                    icon={<Mail size={20} className="text-text-secondary" />}
                  />
                </div>

                <div>
                  <label className="block text-text-main font-semibold mb-3 text-sm uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
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

              {/* Register Button */}
              <motion.div variants={fadeInUp} className="mt-8">
                <Button 
                  type="submit" 
                  isLoading={isLoading}
                  disabled={!username.trim() || !email.trim() || !password.trim()}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transform hover:scale-105 transition-all duration-300 shadow-2xl border-0"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap size={20} />
                      </motion.div>
                      <span className="ml-2">Creating Account...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Zap size={20} className="mr-2" />
                      Create Account
                    </span>
                  )}
                </Button>
              </motion.div>

              {/* Login Link */}
              <motion.div variants={fadeInUp} className="text-center mt-6 pt-6 border-t border-border">
                <p className="text-text-secondary">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="font-bold text-primary hover:text-accent transition-colors duration-300 underline"
                  >
                    Sign In
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

export default RegisterPage;