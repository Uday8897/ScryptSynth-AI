import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';
import { Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

// A simple component to display a single review card
const ReviewCard = ({ review, movieDetails }) => {
    const posterUrl = movieDetails?.poster_path
        ? `https://image.tmdb.org/t/p/w342${movieDetails.poster_path}`
        : '/placeholder-poster.png';
    const watchedDate = review.watchedAt ? new Date(review.watchedAt).toLocaleDateString() : 'N/A';

    return (
        <motion.div variants={fadeInUp} className="flex gap-4 p-4 bg-surface rounded-lg border border-border shadow-md">
            <Link to={`/movie/${movieDetails?.id || review.contentId}`}>
                <img src={posterUrl} alt={movieDetails?.title || 'Movie Poster'} className="w-20 h-auto rounded object-cover flex-shrink-0"/>
            </Link>
            <div className="flex-grow overflow-hidden">
                <h3 className="text-lg font-semibold text-text-main truncate mb-1 hover:text-primary">
                    <Link to={`/movie/${movieDetails?.id || review.contentId}`}>
                        {movieDetails?.title || `Content ID: ${review.contentId}`}
                    </Link>
                </h3>
                <div className="flex items-center gap-3 text-sm text-text-secondary mb-2">
                    <span className="flex items-center gap-1 text-yellow-400">
                        <Star size={16} fill="currentColor"/> {review.rating}/10
                    </span>
                    <span className="flex items-center gap-1">
                       <Calendar size={14} /> {watchedDate}
                    </span>
                </div>
                <p className="text-sm text-text-secondary line-clamp-3 italic">
                    {review.reviewText || "No review text provided."}
                </p>
            </div>
        </motion.div>
    );
};


const MyReviewsPage = () => {
    const { user } = useAuth();
    const [reviewsWithDetails, setReviewsWithDetails] = useState([]); // Store combined data
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.id) return;

        const fetchReviewsAndDetails = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch the user's reviews
                console.log("Fetching reviews for user:", user.id);
                const reviewsResponse = await api.get(`/api/history/my-reviews`); // Use the dedicated endpoint
                const reviewsData = reviewsResponse.data;
                console.log("Fetched reviews:", reviewsData);

                if (!reviewsData || reviewsData.length === 0) {
                    setReviewsWithDetails([]);
                    setIsLoading(false);
                    return;
                }

                // 2. Fetch movie details for each review (can be slow, consider backend aggregation later)
                const detailedReviewsPromises = reviewsData.map(async (review) => {
                    // Extract movie ID (handle potential "tmdb_" prefix if your backend sends it)
                    const movieId = String(review.contentId);
                    console.log(`Fetching details for movie ID: ${movieId} from review ${review.id}`);
                    try {
                        const movieRes = await api.get(`/api/content/movies/${movieId}`);
                        return { ...review, movieDetails: movieRes.data };
                    } catch (movieError) {
                        console.error(`Failed to fetch details for movie ${movieId}:`, movieError);
                        return { ...review, movieDetails: null }; // Handle case where movie fetch fails
                    }
                });

                const combinedData = await Promise.all(detailedReviewsPromises);
                console.log("Combined review data:", combinedData);
                setReviewsWithDetails(combinedData);

            } catch (error) {
                toast.error("Could not load your reviews.");
                console.error("Fetch reviews error:", error);
                setReviewsWithDetails([]); // Clear on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviewsAndDetails();
    }, [user]); // Re-fetch if user changes

    return (
        <motion.main initial="hidden" animate="visible" variants={fadeIn} className="max-w-6xl mx-auto p-8">
            <motion.h1 variants={fadeInUp} className="mb-8 text-5xl font-display text-primary tracking-wider">My Reviews</motion.h1>
            {isLoading ? (
                <p className="text-text-secondary text-center text-lg animate-pulse">Loading your reviews...</p>
            ) : reviewsWithDetails.length === 0 ? (
                 <p className="text-text-secondary text-center italic text-lg">You haven't reviewed any movies yet. Go watch something!</p>
            ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviewsWithDetails.map(review => (
                        <ReviewCard key={review.id} review={review} movieDetails={review.movieDetails} />
                    ))}
                </motion.div>
            )}
        </motion.main>
    );
};

export default MyReviewsPage;