import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Sprout, LogOut, MessageSquare, LayoutDashboard, Store } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';
import Footer from '@/components/Footer';

export default function MainLayout() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <Sprout className="w-8 h-8 text-green-600" />
              <span className="font-bold text-xl text-stone-900">Smart Mandi</span>
            </Link>

            <nav className="flex items-center gap-4">
              {user && profile ? (
                <>
                  {profile.role === 'farmer' ? (
                    <Link to="/dashboard">
                      <Button variant="ghost" className="gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/market">
                      <Button variant="ghost" className="gap-2">
                        <Store className="w-4 h-4" />
                        <span className="hidden sm:inline">Market</span>
                      </Button>
                    </Link>
                  )}
                  
                  <Link to="/chat">
                    <Button variant="ghost" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Chats</span>
                    </Button>
                  </Link>

                  <Button variant="outline" onClick={handleLogout} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">Sign Up</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      <VoiceAssistant />
      <Footer />
    </div>
  );
}
