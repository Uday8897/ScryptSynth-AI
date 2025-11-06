import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Film, ImageOff } from 'lucide-react';
import { fadeInUp } from '../../animations/variants';

const MovieCard = ({ movie, className = '' }) => {
  // Validate movie data
  if (!movie) {
    return (
      <div className={`aspect-[2/3] bg-surface rounded-lg flex flex-col items-center justify-center text-text-secondary p-4 text-center border border-border ${className}`}>
        <ImageOff size={40} className="mb-2 text-red-500"/>
        <p className="text-sm">Invalid movie data</p>
      </div>
    );
  }

  // FIX: Use both tmdbId and id fields - prioritize tmdbId, fallback to id
  const tmdbId = movie.tmdbId || movie.id;
  const { 
    title, 
    poster_path, 
    poster_url, 
    rating, 
    year, 
    genres = [] 
  } = movie;

  // Check if movie has valid ID for navigation
  const hasValidId = tmdbId && tmdbId > 0;
  
  // Handle poster image
  const posterUrl = poster_url || (poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null);
  
  // Card content
  const cardContent = (
    <motion.div
      variants={fadeInUp}
      className={`group relative aspect-[2/3] bg-surface rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-border hover:border-primary/30 ${className} ${
        !hasValidId ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {/* Poster Image */}
      <div className="relative w-full h-full">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback when no image */}
        <div 
          className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface to-background text-text-secondary ${
            posterUrl ? 'hidden' : 'flex'
          }`}
        >
          <Film size={48} className="mb-2 opacity-50" />
          <p className="text-sm text-center px-2 opacity-70">No poster available</p>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-end">
          <div className="p-4 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
              {title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-white/80">
              <span>{year || 'Unknown'}</span>
              {rating && (
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {genres.slice(0, 2).map((genre, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-primary/80 text-white text-xs rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Debug info - shows the actual ID being used */}
            {hasValidId && (
              <div className="mt-2 text-xs text-white/60">
                ID: {tmdbId}
              </div>
            )}

            {/* Warning for invalid ID */}
            {!hasValidId && (
              <div className="mt-2 px-2 py-1 bg-red-500/80 text-white text-xs rounded text-center">
                Missing TMDB ID
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Only make it a link if we have a valid ID
  if (hasValidId) {
    return (
      <Link to={`/movie/${tmdbId}`} className="block">
        {cardContent}
      </Link>
    );
  }

  // Otherwise return just the card without navigation
  return cardContent;
};

export default MovieCard;