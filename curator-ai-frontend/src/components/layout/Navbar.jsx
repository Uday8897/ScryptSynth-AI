import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Clapperboard, BrainCircuit, PenSquare, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../ui/SearchBar';
import { motion } from 'framer-motion';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
        isActiveRoute(to)
          ? 'bg-primary/20 text-primary border border-primary/30 shadow-md'
          : 'text-text-secondary hover:text-primary hover:bg-surface/50'
      }`}
    >
      <Icon size={20} />
      {children}
    </Link>
  );

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="flex items-center justify-between px-6 py-4 bg-surface/80 backdrop-blur-lg border-b border-border/50 shadow-md sticky top-0 z-50"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, 15, -10, 0] }}
            transition={{ duration: 0.4, type: 'spring' }}
            className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg shadow-lg"
          >
            <Clapperboard size={24} className="text-white" />
          </motion.div>
        </div>
        <div className="hidden md:flex flex-col">
          <span className="text-xl font-display text-text-main tracking-wide group-hover:text-primary transition-colors">
ScryptSynth AI          </span>
          <span className="text-xs text-text-secondary uppercase tracking-widest">
            AI Story Studio
          </span>
        </div>
      </Link>

      {/* Search Bar */}
      <div className="flex-1 max-w-lg mx-4 hidden md:block">
        <SearchBar placeholder="Search scenes, scripts, or concepts..." />
      </div>

      {/* Navigation Links & User Menu */}
      <div className="flex items-center gap-4">
        <NavLink to="/ai-recommender" icon={BrainCircuit}>
          Movie  Recommender
        </NavLink>
        <NavLink to="/ai-creator" icon={PenSquare}>
          Story Creator
        </NavLink>

        <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-4 border-l border-border/50">
          {/* Notifications */}
          <div className="relative group">
            <button className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-surface/50 transition-all duration-300">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 z-50">
              <p className="text-sm text-text-secondary">You're all caught up — no new alerts!</p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <ProfileDropdown />

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex items-center p-2 text-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300 border border-transparent hover:border-red-400/20"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
