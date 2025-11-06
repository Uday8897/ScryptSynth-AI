import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import ProtectedRoute from './ProtectedRoute';
import AIRecommenderPage from '../pages/AIRecommenderPage';
import AICreatorHubPage from '../pages/AICreatorHubPage';
import MovieDetailPage from '../pages/MovieDetailPage';
import MyReviewsPage from '../pages/MyReviewsPage';
import MyWatchlistPage from '../pages/MyWatchlistPage';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../hooks/useAuth';

// Import the new creative tool pages
import IdeaGeneratorPage from '../pages/tools/IdeaGeneratorPage';
import ShortsScriptPage from '../pages/tools/ShortsScriptPage';
import CaptionOptimizerPage from '../pages/tools/CaptionOptimizerPage';

const AppRoutes = () => {
  const { isAuth } = useAuth();

  return (
    <BrowserRouter>
      {isAuth && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/movie/:movieId" element={<ProtectedRoute><MovieDetailPage /></ProtectedRoute>} />
        <Route path="/my-reviews" element={<ProtectedRoute><MyReviewsPage /></ProtectedRoute>} />
        <Route path="/my-watchlist" element={<ProtectedRoute><MyWatchlistPage /></ProtectedRoute>} />
        <Route path="/ai-recommender" element={<ProtectedRoute><AIRecommenderPage /></ProtectedRoute>} />
        
        {/* AI Creator Routes */}
        <Route path="/ai-creator" element={<ProtectedRoute><AICreatorHubPage /></ProtectedRoute>} />
        <Route path="/ai-creator/idea-generator" element={<ProtectedRoute><IdeaGeneratorPage /></ProtectedRoute>} />
        <Route path="/ai-creator/shorts-script" element={<ProtectedRoute><ShortsScriptPage /></ProtectedRoute>} />
        <Route path="/ai-creator/caption-optimizer" element={<ProtectedRoute><CaptionOptimizerPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;