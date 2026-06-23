import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Tractor, Store, TrendingUp } from 'lucide-react';
import RotatingHero from '../components/RotatingHero';

export default function Home() {
  return (
    <div className="space-y-16 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-50 via-white to-slate-100 shadow-[0_30px_100px_-50px_rgba(15,23,42,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(74,222,128,0.12),_transparent_26%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_1fr] items-center max-w-7xl mx-auto px-6 py-12 sm:px-10 lg:px-16">
          <div className="space-y-8 text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200">
              Smart Mandi hero
            </span>
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
                Fresh farm produce, <span className="text-emerald-600">real mandi prices</span>, and direct buyer connections.
              </h1>
              <p className="max-w-2xl text-lg sm:text-xl leading-8 text-slate-600">
                Smart Mandi brings farmers and buyers closer with a beautiful landing experience, live market insights, and simple ordering.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register?role=farmer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-lg h-14 px-8 rounded-3xl shadow-lg shadow-emerald-500/20">
                  I am a Farmer <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/register?role=buyer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-lg h-14 px-8 rounded-3xl border-2 border-slate-200 hover:bg-slate-50">
                  I am a Buyer <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-white/90 border border-slate-200 p-5 shadow-sm">
                <p className="text-4xl font-bold text-emerald-600">1200+</p>
                <p className="mt-2 text-sm text-slate-600">Farmers onboarded</p>
              </div>
              <div className="rounded-3xl bg-white/90 border border-slate-200 p-5 shadow-sm">
                <p className="text-4xl font-bold text-slate-900">24/7</p>
                <p className="mt-2 text-sm text-slate-600">Live mandi updates</p>
              </div>
              <div className="rounded-3xl bg-white/90 border border-slate-200 p-5 shadow-sm">
                <p className="text-4xl font-bold text-slate-900">100%</p>
                <p className="mt-2 text-sm text-slate-600">Transparent deals</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <RotatingHero />
            <div className="rounded-[2rem] bg-white/95 border border-slate-200 p-6 shadow-xl shadow-slate-300/20 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-slate-900">Auto-rotating landing images</h2>
              <p className="mt-3 text-slate-600 leading-7">
                The hero automatically cycles through beautiful farm and market photos, giving the landing page a lively, polished look.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.2)] transition-transform duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-6">
            <Tractor className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900">For Farmers</h3>
          <p className="mt-3 text-slate-600 leading-7">Share fresh produce, manage your listings, and see intelligent mandi price guidance.</p>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.2)] transition-transform duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-sky-50 rounded-3xl flex items-center justify-center text-sky-600 mb-6">
            <Store className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900">For Buyers</h3>
          <p className="mt-3 text-slate-600 leading-7">Browse fresh produce, compare prices, and connect directly with farmers.</p>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.2)] transition-transform duration-300 hover:-translate-y-1">
          <div className="w-14 h-14 bg-orange-50 rounded-3xl flex items-center justify-center text-orange-600 mb-6">
            <TrendingUp className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900">Live Market Insights</h3>
          <p className="mt-3 text-slate-600 leading-7">Use real-time mandi data to make better buying and selling decisions.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto rounded-[2rem] bg-slate-900 text-white p-10 sm:p-14 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)]">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-center">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-300">Why Smart Mandi</p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">A trusted platform for modern agricultural trade.</h2>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">From farmers to buyers, every user gets a smooth experience, transparent pricing, and a beautiful interface designed for fast decisions.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-6 border border-white/10">
              <p className="text-3xl font-semibold text-emerald-300">Fast</p>
              <p className="mt-3 text-slate-300">Access fresh produce and market updates quickly.</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6 border border-white/10">
              <p className="text-3xl font-semibold text-cyan-300">Trusted</p>
              <p className="mt-3 text-slate-300">Transparent, direct deals between farmers and buyers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
