// Home page - Project introduction and overview
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Vote, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Privacy-Preserving",
      description: "FHE encryption ensures your votes remain completely private while maintaining verifiability.",
    },
    {
      icon: Vote,
      title: "Batch Voting",
      description: "Vote on multiple proposals at once in a single transaction, saving time and costs.",
    },
    {
      icon: Lock,
      title: "Secure & Transparent",
      description: "All votes recorded on-chain with cryptographic proofs for maximum security.",
    },
    {
      icon: Zap,
      title: "Gas Efficient",
      description: "Optimized smart contracts minimize transaction costs for all participants.",
    },
  ];

  const highlights = [
    "Fully encrypted votes using FHE technology",
    "Vote on multiple proposals simultaneously",
    "Transparent and verifiable results",
    "No compromise between privacy and transparency",
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-20 space-y-8 text-center">
          <Badge className="mx-auto" variant="outline">
            <Shield className="w-3 h-3 mr-2" />
            Privacy-Preserving Governance Platform
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Vote with <span className="bg-gradient-primary bg-clip-text text-transparent">Privacy</span>
            <br />
            Decide with <span className="bg-gradient-primary bg-clip-text text-transparent">Confidence</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ProposalBox revolutionizes decentralized governance by combining privacy-preserving encryption 
            with transparent on-chain voting. Cast multiple votes simultaneously while keeping your choices private.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild className="shadow-primary">
              <Link to="/slates">
                Explore Active Slates
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">ProposalBox</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for modern DAOs and communities that value both privacy and transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="p-6 space-y-4 hover:shadow-primary transition-all hover:scale-105"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Highlights Section */}
        <section className="py-16">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  The Future of
                  <span className="block bg-gradient-primary bg-clip-text text-transparent">
                    Decentralized Voting
                  </span>
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Traditional voting systems force you to choose between privacy and transparency. 
                  ProposalBox uses advanced FHE encryption to give you both.
                </p>
                <Button asChild>
                  <Link to="/slates">
                    Start Voting Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {highlights.map((highlight, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-4 rounded-lg bg-background/50 backdrop-blur"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the future of decentralized governance and cast your first private vote today.
          </p>
          <Button size="lg" asChild className="shadow-primary">
            <Link to="/slates">
              View Active Slates
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Home;
