// Slate detail page with proposals and voting
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePublicClient, useReadContract, useAccount } from "wagmi";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBatchVote } from "@/hooks/useBatchVote";
import { toast } from "@/hooks/use-toast";
import { DEMO_SLATES, type DemoSlate } from "@/lib/demo_data";
import { CONTRACT_ADDRESS, ABI } from "@/lib/contract";
import {
  ArrowLeft, Clock, Users, CheckCircle2, XCircle, Loader2, CheckCheck,
  Calendar, Lock, TrendingUp, Vote, FileText, Info
} from "lucide-react";

const SlateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [slate, setSlate] = useState<DemoSlate | null>(null);
  const [loading, setLoading] = useState(true);
  const [votedOption, setVotedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { submitBatchVote, isEncrypting, isConfirming } = useBatchVote();

  const { data: proposalCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'proposalCount',
  });

  useEffect(() => {
    const fetchSlate = async () => {
      setLoading(true);

      // First check demo slates
      const demoSlate = DEMO_SLATES.find(s => s.id === id);
      if (demoSlate) {
        setSlate(demoSlate);
        setLoading(false);
        return;
      }

      // Then check real proposals
      if (id?.startsWith('real-') && proposalCount && publicClient) {
        const proposalId = parseInt(id.replace('real-', ''));

        try {
          const proposalData = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'getProposal',
            args: [BigInt(proposalId)]
          }) as any;

          // viem returns tuple as array, access by index
          const title = proposalData[0];
          const description = proposalData[1];
          const proposer = proposalData[2];
          const votingDeadline = proposalData[3];
          const status = proposalData[4];
          const votingMode = proposalData[5];
          const optionCount = proposalData[6];
          const totalVoters = proposalData[7];
          const createdAt = proposalData[8];

          const now = Math.floor(Date.now() / 1000);
          const endTime = Number(votingDeadline);

          // Get option titles and vote counts
          const options = [];
          for (let i = 0; i < Number(optionCount); i++) {
            const optionData = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: ABI,
              functionName: 'proposalOptions',
              args: [BigInt(proposalId), BigInt(i)]
            }) as any;

            // viem returns tuple as array
            const optionTitle = optionData[0];
            const optionDescription = optionData[1];
            const voteCount = optionData[2]; // vote count if decrypted

            options.push({
              id: `real-${proposalId}-${i}`,
              title: optionTitle,
              description: optionDescription,
              voteCount: Number(voteCount)
            });
          }

          setSlate({
            id: `real-${proposalId}`,
            title,
            description,
            status: Number(status) === 0 && now < endTime ? 'active' : 'ended',
            deadline: new Date(endTime * 1000).toLocaleDateString(),
            proposals: options,
            category: 'governance',
            totalVotes: Number(totalVoters),
            createdAt: Number(createdAt),
            votingDeadline: Number(votingDeadline),
            proposalStatus: Number(status)
          });

          // Check if user has voted
          if (address) {
            const voteRecordData = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: ABI,
              functionName: 'voteRecords',
              args: [address, BigInt(proposalId)]
            }) as any;

            // viem returns tuple as array
            const hasVotedValue = voteRecordData[4]; // hasVoted is 5th field (index 4)
            setHasVoted(hasVotedValue);

            // If user has voted, try to load their vote choice from localStorage
            if (hasVotedValue) {
              const storageKey = `vote_${address}_real-${proposalId}`;
              const savedVote = localStorage.getItem(storageKey);
              if (savedVote !== null) {
                setVotedOption(parseInt(savedVote));
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch proposal:', error);
        }
      }

      setLoading(false);
    };

    fetchSlate();
  }, [id, proposalCount, publicClient, address]);

  // Handle option click to vote
  const handleVoteClick = async (optionIndex: number) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      });
      return;
    }

    if (hasVoted) {
      toast({
        title: "Already voted",
        description: "You have already voted on this proposal",
        variant: "destructive",
      });
      return;
    }

    if (!id?.startsWith('real-')) {
      toast({
        title: "Demo proposal",
        description: "This is a demo proposal. Real voting is only available for on-chain proposals.",
        variant: "destructive",
      });
      return;
    }

    try {
      const proposalId = parseInt(id.replace('real-', ''));
      await submitBatchVote([proposalId], [optionIndex]);

      toast({
        title: "Vote submitted successfully! 🎉",
        description: "Your vote has been encrypted and recorded on-chain",
      });

      // Save to localStorage
      const storageKey = `vote_${address}_${id}`;
      localStorage.setItem(storageKey, optionIndex.toString());

      setVotedOption(optionIndex);
      setHasVoted(true);
    } catch (error) {
      toast({
        title: "Vote submission failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (!slate) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Slate not found</h1>
            <Link to="/slates">
              <Button className="mt-4">Back to Slates</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-400';
  };

  const getOptionIcon = (index: number) => {
    if (index === 0) return { icon: '✓', label: 'For', color: 'text-green-600' };
    if (index === 1) return { icon: '✗', label: 'Against', color: 'text-red-600' };
    return { icon: '−', label: 'Abstain', color: 'text-gray-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Navigation */}
        <Link to="/slates" className="inline-block mb-6">
          <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Proposals
          </Button>
        </Link>

        <div className="space-y-6">
          {/* Hero Section - Proposal Title & Status */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8">
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{slate.title}</h1>
                <Badge
                  variant={slate.status === 'active' ? "default" : "secondary"}
                  className={`${slate.status === 'active' ? "bg-green-500 hover:bg-green-600" : "bg-gray-400"} text-white px-4 py-1.5 text-sm font-medium`}
                >
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(slate.status)} mr-2 animate-pulse`} />
                  {slate.status === 'active' ? "Active" : "Ended"}
                </Badge>
              </div>

              {/* Key Metrics */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Ends <strong className="text-foreground">{slate.deadline}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span><strong className="text-foreground">{slate.totalVotes}</strong> voters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Vote className="w-4 h-4" />
                  <span><strong className="text-foreground">{slate.proposals.length}</strong> options</span>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Details Card */}
          <Card className="border-2 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Proposal Details</h2>
              </div>
              <p className="text-base leading-relaxed text-muted-foreground">{slate.description}</p>
            </div>
          </Card>

          {/* Voting Options & Actions */}
          <Card className="border-2 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Vote className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Voting Options</h2>
                {hasVoted && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600 ml-auto">
                    <CheckCheck className="w-3 h-3 mr-1" />
                    You Voted
                  </Badge>
                )}
              </div>

              <div className="grid gap-4">
                {slate.proposals.map((proposal, index) => {
                  const { icon, label, color } = getOptionIcon(index);
                  const isUserVote = votedOption === index;
                  const isClickable = slate.status === 'active' && !hasVoted && !isEncrypting && !isConfirming;

                  return (
                    <button
                      key={proposal.id}
                      onClick={() => isClickable && handleVoteClick(index)}
                      disabled={!isClickable}
                      className={`group text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                        isUserVote
                          ? 'border-primary bg-primary/5 shadow-md'
                          : isClickable
                          ? 'border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                          : hasVoted
                          ? 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900'
                          : 'border-slate-200 dark:border-slate-700 cursor-default opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 transition-all ${
                          isUserVote
                            ? 'bg-primary text-primary-foreground scale-110'
                            : isClickable
                            ? `bg-slate-100 dark:bg-slate-800 ${color} group-hover:scale-110 group-hover:bg-primary/10`
                            : `bg-slate-100 dark:bg-slate-800 ${color} opacity-60`
                        }`}>
                          {isUserVote ? <CheckCheck className="w-7 h-7" /> : icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <h3 className="font-bold text-lg">{label}</h3>
                            {isUserVote && (
                              <Badge variant="default" className="bg-primary">Your Vote</Badge>
                            )}
                            {hasVoted && !isUserVote && (
                              <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-700">Locked</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{proposal.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Status Messages */}
              {slate.status === 'active' && !hasVoted && !isEncrypting && !isConfirming && (
                <div className="mt-6 flex items-start gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Click an option to vote. Your vote will be <strong>encrypted using FHE technology</strong> and remain private until decryption.
                  </p>
                </div>
              )}

              {hasVoted && (
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">Vote Successfully Recorded</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Your encrypted vote has been submitted to the blockchain</p>
                    </div>
                  </div>
                </div>
              )}

              {slate.status !== 'active' && !hasVoted && (
                <div className="mt-6 text-center py-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <XCircle className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">Voting Period Has Ended</p>
                  <p className="text-sm text-muted-foreground mt-1">Results will be available after decryption</p>
                </div>
              )}

              {(isEncrypting || isConfirming) && (
                <div className="mt-6 flex items-center justify-center gap-3 bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="font-medium text-primary">
                    {isEncrypting ? 'Encrypting your vote...' : 'Confirming transaction...'}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Info Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timeline Card */}
            <Card className="border-2 shadow-sm">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Timeline</h3>
                </div>
                <div className="space-y-3">
                  {slate.createdAt ? (
                    <>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p className="font-medium text-xs">
                            {new Date(slate.createdAt * 1000).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Deadline</p>
                          <p className="font-medium text-xs">
                            {new Date(slate.votingDeadline * 1000).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="font-medium text-xs">{slate.deadline}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Status Card */}
            <Card className="border-2 shadow-sm">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Status</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Voting Status</p>
                    <Badge variant={slate.status === 'active' ? 'default' : 'secondary'} className="font-medium">
                      {slate.status === 'active' ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Your Status</p>
                    <div className="flex items-center gap-2">
                      {hasVoted ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          <CheckCheck className="w-3 h-3 mr-1" />
                          Voted
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Voted</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Results Section */}
          <Card className="border-2 shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Voting Results</h2>
              </div>

              {slate.proposalStatus === 2 ? (
                <div className="space-y-4">
                  {slate.proposals.map((proposal, index) => {
                    const voteCount = proposal.voteCount || 0;
                    const totalVotes = slate.totalVotes || 1;
                    const percentage = ((voteCount / totalVotes) * 100).toFixed(1);
                    const { icon, label, color } = getOptionIcon(index);

                    return (
                      <div key={proposal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`text-xl ${color}`}>{icon}</span>
                            <span className="font-semibold">{label}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-bold">{voteCount.toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground font-medium min-w-[50px] text-right">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-700 ease-out ${
                              index === 0 ? 'bg-green-500' : index === 1 ? 'bg-red-500' : 'bg-gray-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-4 mt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Total Participants: <span className="font-bold text-foreground text-base">{slate.totalVotes}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <Lock className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg mb-2">Votes are Encrypted</p>
                      <p className="text-sm text-muted-foreground">
                        All votes are secured with FHE encryption. Results will be revealed after voting ends and decryption is completed.
                      </p>
                    </div>
                    <div className="pt-4 border-t inline-block">
                      <p className="text-sm text-muted-foreground">
                        Current Participants: <span className="font-bold text-foreground text-lg">{slate.totalVotes}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default SlateDetail;
