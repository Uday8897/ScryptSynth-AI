import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LoaderCircle, Film } from 'lucide-react';
import { searchMoviesApi } from '../../api'; // Import the specific API function
import useDebounce from '../../hooks/useDebounce';

const SearchResultItem = ({ movie, onResultClick }) => {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
    : null;
  const year = movie.release_date ? `(${movie.release_date.substring(0, 4)})` : '';

  return (
    <Link
      to={`/movie/${movie.id || movie._id}`}
      onClick={onResultClick}
      className="flex items-center p-3 hover:bg-primary/20 rounded-lg transition-colors duration-150"
    >
      <div className="w-12 h-16 bg-surface rounded flex-shrink-0 flex items-center justify-center mr-4 overflow-hidden">
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <Film size={24} className="text-text-secondary" />
        )}
      </div>
      <div className="overflow-hidden">
        <p className="font-semibold text-text-main truncate">{movie.title}</p>
        <p className="text-sm text-text-secondary">{year}</p>
      </div>
    </Link>
  );
};

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  const searchBarRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log(`🔍 Searching for: "${debouncedQuery}"`);
        const response = await searchMoviesApi(debouncedQuery, 10);
        
        console.log(`✅ Search response:`, response.data);
        
        // Handle the response format
        if (response.data.movies) {
          setResults(response.data.movies);
        } else if (Array.isArray(response.data)) {
          setResults(response.data);
        } else {
          setResults([]);
        }
        
      } catch (error) {
        console.error(`❌ Search API error:`, error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleResultClick = () => {
      setQuery('');
      setResults([]);
      setIsFocused(false);
  };

  const showResults = isFocused && (query.length >= 2);

  return (
    <div className="relative w-full max-w-md" ref={searchBarRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search for a film by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full py-2 pl-10 pr-4 rounded-full bg-background border-2 border-surface focus:outline-none focus:ring-2 focus:ring-primary text-text-main text-base"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          {isLoading ? (
             <LoaderCircle size={20} className="animate-spin" />
          ) : (
             <Search size={20} />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-2 w-full bg-surface border border-border rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              results.map((movie, index) => (
                <SearchResultItem 
                  key={movie.id || movie._id || index} 
                  movie={movie} 
                  onResultClick={handleResultClick} 
                />
              ))
            ) : !isLoading && debouncedQuery.length >= 2 ? (
              <div className="p-4 text-center text-text-secondary italic">
                No results found for "{debouncedQuery}"
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;