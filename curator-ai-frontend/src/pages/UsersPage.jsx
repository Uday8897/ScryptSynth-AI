import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api'; // Your main axios instance
import toast from 'react-hot-toast';
import { fadeIn, fadeInUp, staggerContainer } from '../animations/variants';
import { Users, LoaderCircle,User } from 'lucide-react';
import FollowButton from '../components/ui/FollowButton'; // Import the button
import { Link } from 'react-router-dom';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                // --- API CALL TO GET ALL USERS ---
                // Adjust endpoint if your User Service uses a different path
                const response = await api.get('/api/users');
                // Ensure response data is an array
                setUsers(Array.isArray(response.data) ? response.data : []);
                console.log("Fetched users:", response.data);
            } catch (error) {
                toast.error("Could not load user list.");
                console.error("Fetch users error:", error);
                setUsers([]); // Set empty array on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []); // Fetch only once on mount

    return (
        <motion.main
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto p-8" // Adjusted width
        >
            <motion.div variants={fadeInUp} className="text-center mb-12">
                 <div className="inline-block mb-4 p-3 bg-primary/10 rounded-full border border-primary/20">
                    <Users size={32} className="text-primary"/>
                 </div>
                <h1 className="mb-4 text-5xl font-display text-text-main tracking-tight uppercase"
                    style={{ textShadow: '0 0 20px rgba(162, 89, 255, 0.5)' }}>
                    Curator Community
                </h1>
                <p className="text-lg text-text-secondary leading-relaxed">
                    Discover and connect with other film lovers.
                </p>
            </motion.div>

            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <LoaderCircle className="animate-spin text-primary" size={40}/>
                </div>
            ) : users.length === 0 ? (
                 <motion.div variants={fadeInUp} className="text-center py-10 px-6 bg-surface rounded-lg border border-border">
                    <p className="text-text-secondary italic text-lg mb-4">No other users found.</p>
                 </motion.div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4" // Simple list layout
                >
                    {users.map((user) => (
                        <motion.div
                            key={user.id} // Assuming user object has 'id'
                            variants={fadeInUp}
                            className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border shadow-sm"
                        >
                            <Link to={`/profile/${user.id}`} className="flex items-center gap-4 group"> {/* Link to profile (create later) */}
                                {/* Placeholder Avatar */}
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                     <User size={24} className="text-primary"/>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-text-main font-semibold group-hover:text-primary truncate">
                                        {user.displayName || user.username || `User ${user.id}`} {/* Display name or username */}
                                    </p>
                                    {/* Optional: Add user bio or join date */}
                                     {/* <p className="text-xs text-text-secondary truncate">Joined Oct 2025</p> */}
                                </div>
                            </Link>
                            {/* Follow Button */}
                            <div className="flex-shrink-0 w-32"> {/* Fixed width container for button */}
                                <FollowButton profileUserId={user.id} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.main>
    );
};

export default UsersPage;