import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';
import MovieCard from '../components/ui/MovieCard'; // Re-use the MovieCard

const MyWatchlistPage = () => {
    const { user } = useAuth();
    const [watchlistMovies, setWatchlistMovies] = useState([]); // Stores full movie details
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.id) return;

        const fetchWatchlistAndDetails = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch the user's watchlist items (contains only IDs)
                console.log("Fetching watchlist for user:", user.id);
                const watchlistResponse = await api.get(`/api/history/watchlist/my`);
                const watchlistData = watchlistResponse.data;
                console.log("Fetched watchlist items:", watchlistData);

                if (!watchlistData || watchlistData.length === 0) {
                    setWatchlistMovies([]);
                    setIsLoading(false);
                    return;
                }

                // 2. Fetch movie details for each item in the watchlist
                const movieDetailsPromises = watchlistData.map(async (item) => {
                    // Extract movie ID
                    const movieId = String(item.contentId).replace('tmdb_', '');
                    console.log(`Fetching details for watchlist movie ID: ${movieId}`);
                    try {
                        const movieRes = await api.get(`/api/content/movies/${movieId}`);
                        return movieRes.data; // Return full movie data
                    } catch (movieError) {
                        console.error(`Failed to fetch details for watchlist movie ${movieId}:`, movieError);
                        return null; // Handle case where movie fetch fails
                    }
                });

                const moviesData = (await Promise.all(movieDetailsPromises)).filter(Boolean); // Filter out nulls
                console.log("Fetched watchlist movie details:", moviesData);
                setWatchlistMovies(moviesData);

            } catch (error) {
                toast.error("Could not load your watchlist.");
                console.error("Fetch watchlist error:", error);
                setWatchlistMovies([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWatchlistAndDetails();
    }, [user]);

     return (
        <motion.main initial="hidden" animate="visible" variants={fadeIn} className="max-w-7xl mx-auto p-8"> {/* Wider */}
            <motion.h1 variants={fadeInUp} className="mb-8 text-5xl font-display text-primary tracking-wider">My Watchlist</motion.h1>
             {isLoading ? (
                 <p className="text-text-secondary text-center text-lg animate-pulse">Loading your watchlist...</p>
             ) : watchlistMovies.length === 0 ? (
                  <p className="text-text-secondary text-center italic text-lg">Your watchlist is empty. Time to add some movies!</p>
             ) : (
                 <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                     {watchlistMovies.map(movie => (
                         // Render MovieCard for each movie fetched
                         <MovieCard key={movie.id} movie={movie} />
                     ))}
                 </motion.div>
             )}
         </motion.main>
     );
};

export default MyWatchlistPage;