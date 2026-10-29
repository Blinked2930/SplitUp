import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { LogIn, UserPlus, Sparkles, Shield, Split } from 'lucide-react';

export const LandingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto font-sans">
      {/* Header Badge */}
      <header className="pt-6 flex justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>LekFlow Shared Backend</span>
        </div>
      </header>

      {/* Main Branding Hero */}
      <main className="text-center space-y-6 my-auto">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Split className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Splitup</h1>
          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
            Group expense splitting & debt simplification.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-left">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <Shield className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-bold text-slate-900">Shared Identity</p>
            <p className="text-[11px] text-slate-500 leading-tight">Use your existing LekFlow account</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-bold text-slate-900">Smart Debt Math</p>
            <p className="text-[11px] text-slate-500 leading-tight">Instant multi-currency group settlements</p>
          </div>
        </div>
      </main>

      {/* Auth Actions Footer */}
      <footer className="space-y-3 pb-4">
        {/* Primary Action: Log In for existing Clerk users */}
        <SignInButton mode="modal">
          <button
            type="button"
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </button>
        </SignInButton>

        {/* Secondary Action: Sign Up for new users */}
        <SignUpButton mode="modal">
          <button
            type="button"
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-500" />
            <span>Create New Account</span>
          </button>
        </SignUpButton>

        <p className="text-[11px] text-center text-slate-400 pt-1">
          Supports Google, Apple, and Email authentication via Clerk.
        </p>
      </footer>
    </div>
  );
};

export default LandingScreen;