import React, { useEffect } from 'react';
import { useAuth, useSignIn } from '@clerk/clerk-react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const LandingScreen: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { signIn } = useSignIn();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = '/dashboard';
    }
  }, [isSignedIn, isLoaded]);

  const handleOAuth = (provider: 'oauth_google' | 'oauth_apple') => {
    if (!signIn) return;
    signIn.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/dashboard',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 max-w-md mx-auto text-slate-900">
      {/* Top Brand Tag */}
      <div className="pt-8 flex items-center justify-center gap-2">
        <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20">
          S
        </div>
        <span className="font-black text-xl tracking-tight">Splitup</span>
      </div>

      {/* Hero Content */}
      <div className="space-y-6 my-auto text-center py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Works seamlessly with LekFlow</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Split bills easily with your group.
        </h1>

        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto font-medium">
          Track group expenses, calculate exact settlements, and keep everyone synced on shared trips.
        </p>

        <div className="grid grid-cols-2 gap-3 text-left pt-2">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <Zap className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-bold text-slate-900">Instant Splits</p>
            <p className="text-[11px] text-slate-400">Equal, exact, or share-based</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <p className="text-xs font-bold text-slate-900">Shared Backend</p>
            <p className="text-[11px] text-slate-400">Syncs right into LekFlow</p>
          </div>
        </div>
      </div>

      {/* Login Buttons */}
      <div className="space-y-2.5 pb-4">
        <button
          type="button"
          onClick={() => handleOAuth('oauth_google')}
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 text-white font-semibold text-sm flex items-center justify-center gap-3 shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <span>Continue with Google</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleOAuth('oauth_apple')}
          className="w-full py-3.5 px-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span>Continue with Apple</span>
        </button>
      </div>
    </div>
  );
};

export default LandingScreen;