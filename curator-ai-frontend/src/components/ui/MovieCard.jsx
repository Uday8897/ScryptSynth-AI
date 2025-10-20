import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Import Link
import { Star } from 'lucide-react';
import { fadeInUp } from '../../animations/variants'; // Assuming variants are in this path
const MovieCard = ({ movie }) => {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-poster.png'; // Make sure you have this placeholder image

  const year = movie.release_date ? `(${movie.release_date.substring(0, 4)})` : '';

  return (
    <motion.div
      layout // Add layout prop for smoother animations
      variants={fadeInUp} // Use variants from parent stagger
      className="group" // Add group for hover effects if needed later
    >
      {/* Link wraps the image */}
      <Link to={`/movie/${movie.id}`} title={movie.title}>
        <motion.div
          className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer aspect-[2/3] mb-2" // Added margin-bottom
          whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(139, 92, 246, 0.4)" }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover bg-surface" />
           {/* Optional: Add a subtle overlay on hover */}
           <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
           {/* Display rating on the poster */}
           {movie.vote_average > 0 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                  <Star size={12} fill="currentColor"/>
                  <span>{movie.vote_average.toFixed(1)}</span>
              </div>
           )}
        </motion.div>
      </Link>
      {/* Title and Year below the card */}
      <h3 className="text-sm font-medium text-text-main truncate group-hover:text-primary transition-colors duration-200">{movie.title}</h3>
      <p className="text-xs text-text-secondary">{year}</p>
    </motion.div>
  );
};

export default MovieCard;