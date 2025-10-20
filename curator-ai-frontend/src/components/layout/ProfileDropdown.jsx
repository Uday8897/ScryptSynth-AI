import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, History, List, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const ProfileDropdown = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1.0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger element */}
      <button className="flex items-center gap-2 text-text-secondary hover:text-text-main transition-colors duration-150 focus:outline-none">
        <User size={20} className="text-primary"/>
        <span>{user?.displayName || 'Profile'}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden" animate="visible" exit="exit"
            variants={dropdownVariants}
            className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md shadow-lg bg-surface border border-border z-50 py-1 overflow-hidden" // Added overflow-hidden
          >
            {/* Links to dedicated pages */}
            <Link
              to="/my-reviews" // Correct route
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-main hover:bg-background transition-colors w-full text-left" // Ensure full width and left align
              onClick={() => setIsOpen(false)} // Close on click
            >
              <History size={16} /> My Reviews
            </Link>
            <Link
              to="/my-watchlist" // Correct route
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-main hover:bg-background transition-colors w-full text-left"
              onClick={() => setIsOpen(false)}
            >
              <List size={16} /> My Watchlist
            </Link>
            {/* Add Profile Settings link later */}
            {/* Optional Separator */}
            {/* <div className="h-px bg-border my-1"></div> */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;