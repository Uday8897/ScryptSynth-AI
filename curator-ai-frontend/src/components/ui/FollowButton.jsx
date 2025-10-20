import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, LoaderCircle } from 'lucide-react';
import { followUserApi, unfollowUserApi, getFollowingApi } from '../../api'; // Use named imports
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

// Props: profileUserId - The ID of the user this button represents
const FollowButton = ({ profileUserId }) => {
    const { user: currentUser, isAuth } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true); // Loading initial state
    const [isActionLoading, setIsActionLoading] = useState(false); // Loading follow/unfollow action

    // Determine initial follow status
    useEffect(() => {
        // Reset state if user changes or profile changes
        setIsFollowing(false);
        setIsLoadingInitial(true);

        const checkFollowStatus = async () => {
            if (!isAuth || !currentUser?.id || !profileUserId || currentUser.id === profileUserId) {
                setIsLoadingInitial(false);
                return; // Don't check if not logged in, no profile ID, or it's yourself
            }
            try {
                const followingList = await getFollowingApi(currentUser.id);
                // Ensure IDs are compared correctly (e.g., both as numbers or both as strings)
                const isCurrentlyFollowing = followingList.data.some(
                    followedUser => String(followedUser.id) === String(profileUserId)
                );
                setIsFollowing(isCurrentlyFollowing);
            } catch (error) {
                console.error("Failed to check initial follow status:", error);
            } finally {
                setIsLoadingInitial(false);
            }
        };
        checkFollowStatus();
    }, [currentUser?.id, profileUserId, isAuth]); // Rerun if current user or profile user changes

    const handleFollowToggle = async () => {
        if (!isAuth || !currentUser?.id || isActionLoading || isLoadingInitial) return;

        setIsActionLoading(true);
        const actionToast = toast.loading(isFollowing ? 'Unfollowing...' : 'Following...');

        try {
            if (isFollowing) {
                await unfollowUserApi(profileUserId);
                setIsFollowing(false);
                toast.dismiss(actionToast);
                toast.success(`Unfollowed user ${profileUserId}`); // Use ID for now
            } else {
                await followUserApi(profileUserId);
                setIsFollowing(true);
                toast.dismiss(actionToast);
                toast.success(`Started following user ${profileUserId}`); // Use ID for now
            }
        } catch (error) {
             toast.dismiss(actionToast);
             toast.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'}.`);
             console.error("Follow toggle error:", error);
        } finally {
             setIsActionLoading(false);
        }
    };

    // Don't render the button for the current user or if not logged in
    if (!isAuth || !profileUserId || currentUser?.id === profileUserId) {
        return null;
    }

    // Show loading state while checking initial status
    if (isLoadingInitial) {
         return (
             <div className="h-10 w-28 flex items-center justify-center bg-surface rounded-lg">
                 <LoaderCircle className="animate-spin text-text-secondary" size={18}/>
             </div>
         );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFollowToggle}
            disabled={isActionLoading}
            className={`flex items-center justify-center gap-2 w-full sm:w-auto font-semibold py-2 px-4 rounded-lg shadow-md border transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75 text-sm disabled:opacity-50 ${
                isFollowing
                ? 'bg-green-600/10 text-green-400 border-green-500/50 hover:bg-green-600/20'
                : 'bg-primary hover:bg-violet-600 text-white border-transparent'
            }`}
        >
            {isActionLoading ? (
                 <LoaderCircle className="animate-spin" size={16}/>
            ): isFollowing ? (
                 <UserCheck size={16} />
            ) : (
                 <UserPlus size={16} />
            )}
            {isActionLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
        </motion.button>
    );
};

export default FollowButton;