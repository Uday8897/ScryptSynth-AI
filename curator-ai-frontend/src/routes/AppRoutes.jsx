import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import ProtectedRoute from './ProtectedRoute';
import AIRecommenderPage from '../pages/AIRecommenderPage';
import AICreatorHubPage from '../pages/AICreatorHubPage';
import ElaborateIdeaPage from '../pages/tools/ElaborateIdeaPage';
import BrainstormPage from '../pages/tools/BrainstormPage';
import PlanShotsPage from '../pages/tools/PlanShotsPage';
import MovieDetailPage from '../pages/MovieDetailPage'; // Import Movie Detail Page
import MyReviewsPage from '../pages/MyReviewsPage';     // Import My Reviews Page
import MyWatchlistPage from '../pages/MyWatchlistPage'; // Import My Watchlist Page
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../hooks/useAuth';
import FeedPage from '../pages/FeedPage'; // <-- Import the new page
import UsersPage from '../pages/UsersPage'; // <-- Import the new page
const AppRoutes = () => {
  const { isAuth } = useAuth();

  return (
    <BrowserRouter>
      {isAuth && <Navbar />} {/* Render Navbar only if authenticated */}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/movie/:movieId" element={<ProtectedRoute><MovieDetailPage /></ProtectedRoute>} />
        <Route path="/my-reviews" element={<ProtectedRoute><MyReviewsPage /></ProtectedRoute>} />
        <Route path="/my-watchlist" element={<ProtectedRoute><MyWatchlistPage /></ProtectedRoute>} />
        <Route path="/ai-recommender" element={<ProtectedRoute><AIRecommenderPage /></ProtectedRoute>} />
        <Route path="/ai-creator" element={<ProtectedRoute><AICreatorHubPage /></ProtectedRoute>} />
        <Route path="/ai-creator/elaborate" element={<ProtectedRoute><ElaborateIdeaPage /></ProtectedRoute>} />
        <Route path="/ai-creator/brainstorm" element={<ProtectedRoute><BrainstormPage /></ProtectedRoute>} />
        <Route path="/ai-creator/plan-shots" element={<ProtectedRoute><PlanShotsPage /></ProtectedRoute>} />
<Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} /> {/* <-- ADD FEED ROUTE */}
        {/* Add a catch-all or 404 route if desired */}
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} /> {/* <-- ADD USERS ROUTE */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;