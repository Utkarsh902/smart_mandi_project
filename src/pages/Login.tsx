import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully');
      // Navigation is handled by App.tsx based on auth state
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if profile exists
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create default profile as buyer if it doesn't exist
        await setDoc(docRef, {
          role: 'buyer', // Default role for Google login
          name: user.displayName || 'User',
          phone: '',
          location: '',
          createdAt: serverTimestamp()
        });
        // Fetch the newly created profile so the app can navigate
        await useAuthStore.getState().fetchProfile(user.uid);
      }
      
      toast.success('Logged in with Google');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
      <div className="w-full max-w-lg px-4 sm:px-6">
        <Card className="overflow-hidden rounded-[2rem] border border-emerald-100 shadow-[0_30px_80px_-40px_rgba(16,185,129,0.45)]">
          <div className="bg-gradient-to-r from-emerald-600 via-lime-500 to-yellow-400 px-8 py-8 text-white">
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-100/90">Smart Mandi Login</p>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold">Welcome back!</h1>
            <p className="mt-3 max-w-xl text-sm sm:text-base text-white/90">Login to manage farm listings, track mandi pricing, and connect with buyers instantly.</p>
          </div>
          <CardContent className="bg-white px-8 py-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-3xl" disabled={loading}>
                {loading ? 'Logging in...' : 'Login with Email'}
              </Button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-emerald-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase text-slate-500">
                <span className="bg-white px-3">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50 py-4 rounded-3xl"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </Button>

            <div className="mt-5 text-center text-sm text-slate-600">
              Don't have an account? <Link to="/register" className="font-semibold text-emerald-600 hover:underline">Sign up</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
