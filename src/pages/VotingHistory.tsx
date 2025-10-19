import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, History, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VoteRecord {
  proposalId: number;
  proposalTitle: string;
  choice: 'For' | 'Against' | 'Abstain';
  timestamp: number;
  txHash: string;
}

export default function VotingHistory() {
  const { address, isConnected } = useAccount();
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    // 模拟获取投票历史（实际应该从合约事件获取）
    const fetchVotingHistory = async () => {
      try {
        // TODO: 实现从合约事件日志获取投票历史
        // 示例数据
        const mockVotes: VoteRecord[] = [];
        setVotes(mockVotes);
      } catch (error) {
        console.error('Failed to fetch voting history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotingHistory();
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <Card className="shadow-xl border-0">
              <CardContent className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
                  <Wallet className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold">Wallet Connection Required</p>
                  <p className="text-muted-foreground">
                    Please connect your wallet to view your voting history
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const getChoiceBadge = (choice: VoteRecord['choice']) => {
    const variants = {
      For: { variant: 'default' as const, className: 'bg-green-500' },
      Against: { variant: 'destructive' as const, className: '' },
      Abstain: { variant: 'secondary' as const, className: '' }
    };
    return variants[choice];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
              <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Voting History
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your Voting Record
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>
          </div>

          {/* Voting History List */}
          {loading ? (
            <Card className="shadow-xl border-0">
              <CardContent className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto animate-pulse">
                  <History className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-muted-foreground">Loading voting history...</p>
              </CardContent>
            </Card>
          ) : votes.length === 0 ? (
            <Card className="shadow-xl border-0">
              <CardContent className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold">No Voting Records</p>
                  <p className="text-muted-foreground">
                    You haven't cast any votes yet. Start participating in governance!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {votes.map((vote, index) => {
                const badgeStyle = getChoiceBadge(vote.choice);
                return (
                  <Card key={index} className="shadow-xl border-0 hover:shadow-2xl transition-all">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">Proposal #{vote.proposalId}</CardTitle>
                          <CardDescription className="text-base">{vote.proposalTitle}</CardDescription>
                        </div>
                        <Badge variant={badgeStyle.variant} className={badgeStyle.className}>
                          {vote.choice}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-medium">Time:</span>
                          <span>{new Date(vote.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-medium">TX:</span>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${vote.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-purple-600 dark:text-purple-400 font-mono text-xs truncate"
                          >
                            {vote.txHash}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
