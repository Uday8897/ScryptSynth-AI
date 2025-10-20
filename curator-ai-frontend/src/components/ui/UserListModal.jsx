import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, LoaderCircle } from 'lucide-react';
import { getFollowersApi, getFollowingApi } from '../../api';
import FollowButton from './FollowButton'; // Import the button
import { Link } from 'react-router-dom';

// Props: userId - ID of the user whose list we're showing
// Props: listType - 'followers' or 'following'
// Props: onClose - function to close the modal
const UserListModal = ({ userId, listType, onClose }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const title = listType === 'followers' ? 'Followers' : 'Following';

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const apiCall = listType === 'followers' ? getFollowersApi : getFollowingApi;
                const response = await apiCall(userId);
                // NOTE: The backend currently only returns IDs.
                // In a real app, you'd fetch user details (username, avatar) for each ID.
                // For now, we'll just display the IDs.
                setUsers(response.data);
            } catch (error) {
                console.error(`Failed to fetch ${listType}:`, error);
                // Show toast?
            } finally {
                setIsLoading(false);
            }
        };
        if (userId) {
            fetchUsers();
        }
    }, [userId, listType]);

    const backdropVariants = { /* ... */ }; // Copy from ReviewModal
    const modalVariants = { /* ... */ };   // Copy from ReviewModal

    return (
        <motion.div
            key="userlist-backdrop"
            initial="hidden" animate="visible" exit="exit"
            variants={backdropVariants}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                key="userlist-modal"
                variants={modalVariants}
                className="bg-surface rounded-xl shadow-2xl w-full max-w-md border border-border overflow-hidden flex flex-col max-h-[80vh]" // Added max-h
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                    <h2 className="text-lg font-semibold text-text-main flex items-center gap-2">
                        <Users size={20} className="text-primary"/> {title}
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-main"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </motion.button>
                </div>

                {/* Body - Scrollable User List */}
                <div className="p-4 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <LoaderCircle className="animate-spin text-primary" size={32}/>
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-center text-text-secondary italic py-8">
                            No users found in this list.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {users.map((user) => (
                                <li key={user.id} className="flex items-center justify-between p-2 rounded hover:bg-background">
                                    <Link to={`/profile/${user.id}`} className="flex items-center gap-3 group">
                                         {/* Placeholder Avatar */}
                                        <div className="w-10 h-10 bg-primary/20 rounded-full flex-shrink-0"></div>
                                        <span className="text-text-main group-hover:text-primary font-medium">
                                            User ID: {user.id} {/* TODO: Replace with username */}
                                        </span>
                                    </Link>
                                    {/* Pass the ID of the user being displayed */}
                                    <FollowButton profileUserId={user.id} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UserListModal;