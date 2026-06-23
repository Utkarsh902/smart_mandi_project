import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Layouts
import MainLayout from './layouts/MainLayout';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Market = lazy(() => import('./pages/Market'));
const Chat = lazy(() => import('./pages/Chat'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
  </div>
);

function App() {
  const { setUser, fetchProfile, setLoading, loading, user, profile } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        useAuthStore.getState().setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={user ? (profile ? <Navigate to={profile.role === 'farmer' ? '/dashboard' : '/market'} /> : <PageLoader />) : <Login />} />
            <Route path="register" element={user ? (profile ? <Navigate to={profile.role === 'farmer' ? '/dashboard' : '/market'} /> : <PageLoader />) : <Register />} />
            
            {/* Protected Routes */}
            <Route path="dashboard" element={user ? (profile?.role === 'farmer' ? <Dashboard /> : <Navigate to="/market" />) : <Navigate to="/login" />} />
            <Route path="market" element={user ? (profile?.role === 'buyer' ? <Market /> : <Navigate to="/dashboard" />) : <Navigate to="/login" />} />
            <Route path="chat" element={user ? <Chat /> : <Navigate to="/login" />} />
            <Route path="chat/:chatId" element={user ? <Chat /> : <Navigate to="/login" />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
