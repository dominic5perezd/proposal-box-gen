// Header component with navigation and wallet connection
import { Link } from "react-router-dom";
import { Vote } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Vote className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ProposalBox
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/slates" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Slates
          </Link>
          <Link to="/create" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Create
          </Link>
          <Link to="/history" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            History
          </Link>
          <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            About
          </Link>
        </nav>

        {/* Wallet Connection */}
        <div className="flex items-center gap-3">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
