// About page explaining ProposalBox
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Vote, Zap } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Shield,
      title: "Privacy-Preserving",
      description: "Your votes are encrypted client-side using FHE encryption, ensuring complete privacy while maintaining verifiability.",
    },
    {
      icon: Vote,
      title: "Batch Voting",
      description: "Vote on multiple proposals simultaneously in a single transaction, saving time and gas costs.",
    },
    {
      icon: Lock,
      title: "Secure & Transparent",
      description: "All votes are recorded on-chain with cryptographic proofs, ensuring security and transparency.",
    },
    {
      icon: Zap,
      title: "Efficient Governance",
      description: "Streamlined voting process makes community governance more accessible and efficient for everyone.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-6 py-8">
          <h1 className="text-5xl md:text-6xl font-bold">
            About <span className="bg-gradient-primary bg-clip-text text-transparent">ProposalBox</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A next-generation voting platform that combines privacy, efficiency, and transparency 
            for decentralized governance.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-8 space-y-4 hover:shadow-primary transition-all">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* How it works */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center">How It Works</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Browse Slates</h4>
                  <p className="text-muted-foreground">
                    Explore active voting slates containing multiple related proposals grouped together.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Cast Your Votes</h4>
                  <p className="text-muted-foreground">
                    Select your choice (For, Against, or Abstain) for each proposal in the slate.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Encrypted Submission</h4>
                  <p className="text-muted-foreground">
                    Your votes are encrypted using FHE in your browser before being submitted to the blockchain.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">View Results</h4>
                  <p className="text-muted-foreground">
                    After the voting period ends, results are decrypted and displayed transparently.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
