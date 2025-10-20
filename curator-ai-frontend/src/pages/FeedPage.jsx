import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getFeedApi } from '../api'; // Use named import
import toast from 'react-hot-toast';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';
import { Rss, Activity ,LoaderCircle} from 'lucide-react'; // Added Activity icon

// Simple component to display a feed item
const FeedItemCard = ({ item }) => {
    // Basic time ago function (use a library like date-fns for production)
    const timeAgo = (timestamp) => {
        if (!timestamp) return '';
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.max(0, Math.floor(seconds)) + "s ago"; // Ensure non-negative
    };

    return (
        <motion.div
            variants={fadeInUp}
            className="p-4 bg-surface rounded-lg border border-border shadow-sm flex items-start gap-4" // Increased gap
        >
             <Activity size={20} className="text-primary mt-1 flex-shrink-0"/> {/* Changed icon */}
             <div className='flex-grow'>
                <p className="text-text-main text-base leading-relaxed">{item.content || "Activity update"}</p> {/* Default text */}
                <p className="text-xs text-text-secondary mt-1.5">{timeAgo(item.timestamp)}</p> {/* Increased margin */}
             </div>
        </motion.div>
    );
}

const FeedPage = () => {
    const [feedItems, setFeedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            setIsLoading(true);
            try {
                const response = await getFeedApi();
                // Ensure response data is an array before setting state
                setFeedItems(Array.isArray(response.data) ? response.data : []);
                console.log("Fetched feed:", response.data);
            } catch (error) {
                toast.error("Could not load your activity feed.");
                console.error("Fetch feed error:", error);
                setFeedItems([]); // Set to empty array on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeed();
    }, []); // Fetch only once on mount

    return (
        <motion.main
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl mx-auto p-8" // Slightly wider container
        >
            <motion.div variants={fadeInUp} className="text-center mb-12"> {/* Increased margin */}
                 <div className="inline-block mb-4 p-3 bg-primary/10 rounded-full border border-primary/20">
                    <Rss size={32} className="text-primary"/>
                 </div>
                <h1 className="mb-4 text-5xl font-display text-text-main tracking-tight uppercase"
                    style={{ textShadow: '0 0 20px rgba(162, 89, 255, 0.5)' }}>
                    Activity Feed
                </h1>
                <p className="text-lg text-text-secondary leading-relaxed">
                    The latest updates from your cinematic circle.
                </p>
            </motion.div>

            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <LoaderCircle className="animate-spin text-primary" size={40}/>
                </div>
            ) : feedItems.length === 0 ? (
                 <motion.div variants={fadeInUp} className="text-center py-10 px-6 bg-surface rounded-lg border border-border">
                    <p className="text-text-secondary italic text-lg mb-4">Your feed is currently empty.</p>
                    <p className="text-text-secondary">Follow some users or review movies to populate your feed!</p>
                 </motion.div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-5" // Increased space between items
                >
                    {feedItems.map((item, index) => (
                        <FeedItemCard key={item.timestamp || index} item={item} /> // Use timestamp as key if available
                    ))}
                </motion.div>
            )}
        </motion.main>
    );
};

export default FeedPage;