import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import OnboardingWizard from './pages/OnboardingWizard';
import UniversityDiscovery from './pages/UniversityDiscovery';
import ApplicationTracker from './pages/ApplicationTracker';
import GoogleCallback from './pages/GoogleCallback';
import ProtectedRoute from './components/ProtectedRoute';
import AICounsellor from './components/AICounsellor';

const RouteLogic = () => {
  const { stage } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/google-success" element={<GoogleCallback />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {stage === 2 ? <Navigate to="/onboarding" /> : <Dashboard />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/discovery"
        element={
          <ProtectedRoute>
            <UniversityDiscovery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracker"
        element={
          <ProtectedRoute>
            <ApplicationTracker />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// Wrapper to conditionally show AI panel
const AppContent = () => {
  const location = useLocation();

  // Hide AI panel on these routes
  const hideAIRoutes = ['/', '/login', '/signup', '/onboarding', '/google-success'];
  const showAI = !hideAIRoutes.includes(location.pathname);

  return (
    <>
      <RouteLogic />
      {showAI && <AICounsellor />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
