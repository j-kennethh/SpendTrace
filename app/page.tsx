import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-24">
      <h1 className="text-4xl font-bold text-primary mb-4">SpendTrace</h1>
      <p className="text-muted-foreground mb-8">The "Smart Mint" Theme is active.</p>
      
      {/* This button won't exist yet until we add it in Step 5, but let's prep for it */}
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition">
        Get Started
      </button>
    </div>
  );
}
