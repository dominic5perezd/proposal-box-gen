// Home page - Slate list
import { useState, useEffect } from "react";
import { useReadContract, usePublicClient } from "wagmi";
import { Header } from "@/components/layout/Header";
import { SlateGrid } from "@/components/slate/SlateGrid";
import { Button } from "@/components/ui/button";
import { CONTRACT_ADDRESS, ABI } from "@/lib/contract";
import { DEMO_SLATES, type DemoSlate } from "@/lib/demo_data";
import { Sparkles, Loader2 } from "lucide-react";

const Index = () => {
  const [filter, set_filter] = useState<"all" | "active" | "ended">("all");
  const [slates, setSlates] = useState<DemoSlate[]>([]);
  const [loading, setLoading] = useState(true);
  const publicClient = usePublicClient();

  const { data: proposalCount, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'proposalCount',
  });

  useEffect(() => {
    const fetchSlates = async () => {
      setLoading(true);
      const items: DemoSlate[] = [...DEMO_SLATES]; // Start with demo data

      // Add real proposals from contract
      if (proposalCount && publicClient) {
        const count = Number(proposalCount);

        for (let i = 1; i <= count; i++) {
          try {
            console.log(`[Slates] Fetching proposal #${i}...`);

            const proposalData = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: ABI,
              functionName: 'getProposal',
              args: [BigInt(i)]
            }) as any;

            console.log(`[Slates] Proposal #${i} RAW:`, proposalData);

            // viem returns tuple as array, access by index
            const title = proposalData[0];
            const description = proposalData[1];
            const proposer = proposalData[2];
            const votingDeadline = proposalData[3];
            const status = proposalData[4];
            const votingMode = proposalData[5];
            const optionCount = proposalData[6];
            const totalVoters = proposalData[7];

            console.log(`[Slates] Proposal #${i} parsed:`, {
              title,
              description,
              optionCount: Number(optionCount),
              status: Number(status)
            });

            const now = Math.floor(Date.now() / 1000);
            const endTime = Number(votingDeadline);

            // Get option titles
            const options = [];
            for (let j = 0; j < Number(optionCount); j++) {
              console.log(`[Slates] Fetching option #${i}-${j}...`);

              const optionData = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: ABI,
                functionName: 'proposalOptions',
                args: [BigInt(i), BigInt(j)]
              }) as any;

              // viem returns tuple as array
              const optionTitle = optionData[0];
              const optionDescription = optionData[1];

              console.log(`[Slates] Option #${i}-${j}:`, {
                title: optionTitle,
                description: optionDescription
              });

              options.push({
                id: `real-${i}-${j}`,
                title: optionTitle,
                description: optionDescription
              });
            }

            console.log(`[Slates] Proposal #${i} loaded with ${options.length} options`);

            items.unshift({ // Add real proposals at the beginning
              id: `real-${i}`,
              title,
              description,
              status: Number(status) === 0 && now < endTime ? 'active' : 'ended',
              deadline: new Date(endTime * 1000).toLocaleDateString(),
              proposals: options,
              category: 'governance',
              totalVotes: Number(totalVoters)
            });
          } catch (error) {
            console.error(`[Slates] Failed to fetch proposal ${i}:`, error);
          }
        }
      }

      setSlates(items);
      setLoading(false);
    };

    fetchSlates();
  }, [proposalCount, publicClient]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <main className="container mx-auto px-4 py-12 space-y-12">
        {/* Hero section */}
        <div className="text-center space-y-6 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Privacy-Preserving Governance
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Vote with Confidence
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cast encrypted votes on multiple proposals simultaneously. Your choices remain private while results stay transparent.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => set_filter("all")}
          >
            All Slates
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => set_filter("active")}
          >
            Active
          </Button>
          <Button
            variant={filter === "ended" ? "default" : "outline"}
            onClick={() => set_filter("ended")}
          >
            Ended
          </Button>
        </div>

        {/* Slate grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <SlateGrid slates={slates} filter={filter} />
        )}
      </main>
    </div>
  );
};

export default Index;
