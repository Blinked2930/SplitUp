import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { LogIn, UserPlus, Sparkles, Shield, Split } from 'lucide-react';

export const LandingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Background Glow Overlay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <header className="pt-8 flex justify-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-emerald-400 text-xs font-medium backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>LekFlow Shared Auth Connected</span>
        </div>
      </header>

      {/* Main Branding Hero */}
      <main className="max-w-md mx-auto w-full text-center space-y-6 my-auto z-10">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Split className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white">LekSplit</h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Group expense splitting & debt simplification built for LekFlow.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-left">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-1">
            <Shield className="w-4 h-4 text-emerald-400" />
            <p className="text-xs font-bold text-slate-200">Shared Identity</p>
            <p className="text-[11px] text-slate-400 leading-tight">Use your existing LekFlow account</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <p className="text-xs font-bold text-slate-200">Smart Debt Math</p>
            <p className="text-[11px] text-slate-400 leading-tight">Instant multi-currency group settlements</p>
          </div>
        </div>
      </main>

      {/* Auth Actions Footer */}
      <footer className="max-w-md mx-auto w-full space-y-3 pb-6 z-10">
        {/* Primary Action: Log In for existing Clerk users */}
        <SignInButton mode="modal">
          <button
            type="button"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In (Existing Account)</span>
          </button>
        </SignInButton>

        {/* Secondary Action: Sign Up for new users */}
        <SignUpButton mode="modal">
          <button
            type="button"
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-400" />
            <span>Create New Account</span>
          </button>
        </SignUpButton>

        <p className="text-[11px] text-center text-slate-500 pt-1">
          Supports Google, Apple, and Email authentication via Clerk.
        </p>
      </footer>
    </div>
  );
};

export default LandingScreen;