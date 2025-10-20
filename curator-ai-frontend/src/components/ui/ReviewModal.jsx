import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Ensure AnimatePresence is imported
import { X, Star } from 'lucide-react';
import Button from '../common/Button'; // Assuming you have this common component
import toast from 'react-hot-toast';

// Define motion variants for the modal and backdrop
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1.0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
};

const ReviewModal = ({ movie, onClose, onSubmit, isSubmitting }) => {
  // --- STATE ---
  const [rating, setRating] = useState(0); // 0 = not rated yet
  const [reviewText, setReviewText] = useState('');
  const textareaRef = useRef(null); // Ref for auto-resizing textarea

  // --- DERIVED DATA ---
  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` // Use a suitable size for modal
    : '/placeholder-poster.png'; // Make sure you have a placeholder image

  // --- EFFECTS ---
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      // Set height based on scroll height, but add a small buffer (4px)
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 4}px`;
    }
  }, [reviewText]);

  // --- HANDLERS ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating (1-10)');
      return;
    }
    // Call the onSubmit function passed from the parent (MovieDetailPage)
    // which handles the API call and loading state management.
    onSubmit({ rating, reviewText });
  };

  // --- RENDER ---
  return (
    // AnimatePresence is needed in the PARENT component (MovieDetailPage) that renders this modal conditionally
    <motion.div
      key="review-modal-backdrop" // Unique key for AnimatePresence
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={backdropVariants}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" // Darker backdrop
      onClick={onClose} // Allow closing by clicking backdrop
    >
      <motion.div
        key="review-modal-content" // Unique key for AnimatePresence
        variants={modalVariants}
        className="bg-surface rounded-xl shadow-2xl w-full max-w-xl border border-border/50 overflow-hidden" // Wider modal (max-w-xl)
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click from triggering inside modal
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h2 className="text-xl font-display text-text-main tracking-wide">
            Log / Review: <span className="text-primary">{movie?.title || 'Movie'}</span>
          </h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-text-secondary hover:text-text-main transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </motion.button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start"> {/* Stack on small screens */}
            {/* Poster */}
            <img
                src={posterUrl}
                alt={movie?.title}
                className="w-28 sm:w-24 h-auto rounded object-cover shadow-lg flex-shrink-0 mx-auto sm:mx-0" // Centered on small screens
            />
            {/* Star Rating Section */}
            <div className='flex-grow w-full'> {/* Take remaining space */}
              <label className="block text-sm font-medium text-text-secondary mb-2">Your Rating *</label>
              {/* Star Container with Wrapping */}
              <div className="flex flex-wrap gap-x-1 gap-y-2"> {/* Allow wrapping and add vertical gap */}
                {[...Array(10)].map((_, i) => {
                  const ratingValue = i + 1;
                  return (
                    <motion.button
                      key={ratingValue}
                      type="button"
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(ratingValue)}
                      className={`p-0.5 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary ${
                        ratingValue <= rating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-500'
                      }`}
                      aria-label={`Rate ${ratingValue} stars`}
                    >
                      {/* Slightly larger stars to fill space */}
                      <Star size={30} fill={ratingValue <= rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
                    </motion.button>
                  );
                })}
              </div>
              {rating > 0 && (
                <p className="text-xs text-primary font-semibold mt-2 animate-pulse">
                  You selected: {rating} / 10 Stars
                </p>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="reviewTextModal" className="block text-sm font-medium text-text-secondary mb-2">
              Your Review (Optional)
            </label>
            <textarea
              id="reviewTextModal" // Unique ID if needed
              ref={textareaRef}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your detailed thoughts, analysis, or feelings..."
              className="w-full p-3 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-text-main resize-none overflow-hidden min-h-[100px] text-base" // Ensure text color, min height
              rows={3} // Initial rows
              maxLength={2000} // Add character limit if desired
            />
             {/* Optional character counter */}
             {/* <p className="text-xs text-right text-text-secondary mt-1">{reviewText.length} / 2000</p> */}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end pt-4 border-t border-border/50">
            {/* Pass isSubmitting prop to disable button during API call */}
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || rating === 0} className="min-w-[150px]">
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ReviewModal;