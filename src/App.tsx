import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Dashboard } from './components/Dashboard';
import { LandingScreen } from './components/LandingScreen';

export default function App() {
  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <LandingScreen />
      </SignedOut>
    </>
  );
}