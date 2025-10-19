import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from 'wagmi';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';
import { Loader2, CheckCircle2, ChevronDown, ChevronUp, Info, Clock, Tag, Vote, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProposal() {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();

  // Basic fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('72');
  const [showCustomDuration, setShowCustomDuration] = useState(false);

  // Voting options
  const [voteMode, setVoteMode] = useState<'standard' | 'custom'>('standard');
  const [voteType, setVoteType] = useState<'single' | 'multiple'>('single');
  const [customOptions, setCustomOptions] = useState<string[]>(['', '']);

  // Advanced fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [category, setCategory] = useState('governance');
  const [tags, setTags] = useState('');

  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    const durationInHours = showCustomDuration ? Number(duration) * 24 : Number(duration);
    const durationInSeconds = durationInHours * 3600;

    if (durationInSeconds < 3600 || durationInSeconds > 2592000) {
      toast.error('Duration must be between 1 hour and 30 days');
      return;
    }

    // Prepare voting options
    const finalOptions = voteMode === 'standard' ? ['Yes', 'No', 'Abstain'] : customOptions.filter(o => o.trim());

    if (finalOptions.length < 2) {
      toast.error('At least 2 voting options are required');
      return;
    }

    // VotingMode: 0 = SingleChoice, 1 = MultipleChoice
    const votingMode = voteType === 'single' ? 0 : 1;

    // Option descriptions (simple numbering)
    const optionDescriptions = finalOptions.map((_, idx) => `Option ${idx + 1}`);

    try {
      // Estimate gas first
      let estimatedGas = 10000000n;
      if (publicClient && address) {
        try {
          estimatedGas = await publicClient.estimateContractGas({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'createProposal',
            args: [
              title,
              description,
              BigInt(durationInSeconds),
              votingMode,
              finalOptions,
              optionDescriptions
            ],
            account: address,
          });
          // Add 20% buffer to estimated gas
          estimatedGas = (estimatedGas * 120n) / 100n;
        } catch (e) {
          console.warn('Gas estimation failed, using default:', e);
        }
      }

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'createProposal',
        args: [
          title,
          description,
          BigInt(durationInSeconds),
          votingMode,
          finalOptions,
          optionDescriptions
        ],
        gas: estimatedGas,
      });

      setTxHash(hash);
      toast.success('Proposal created successfully!', {
        description: `Transaction: ${hash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      console.error('Failed to create proposal:', error);
      toast.error('Failed to create proposal', {
        description: error.message || 'Please check network and wallet balance',
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto shadow-xl border-0">
            <CardContent className="pt-16 pb-16 text-center space-y-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Proposal Created Successfully!
                </h2>
                <p className="text-lg text-muted-foreground">
                  Your proposal has been submitted to the blockchain and is now live for voting.
                </p>
                {txHash && (
                  <div className="pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Transaction Hash</p>
                    <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 rounded-lg p-3 break-all">
                      {txHash}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/proposals')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  View All Proposals
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setTitle('');
                    setDescription('');
                    setDuration('72');
                    setShowCustomDuration(false);
                    setVoteMode('standard');
                    setVoteType('single');
                    setCustomOptions(['', '']);
                    setCategory('governance');
                    setTags('');
                    setShowAdvanced(false);
                    setTxHash(undefined);
                  }}
                >
                  Create Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
              <Vote className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Privacy-Preserving Governance
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create New Proposal
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Submit your idea to the community. All votes will be encrypted using FHE technology.
            </p>
          </div>

          {!isConnected ? (
            <Card className="shadow-xl border-0">
              <CardContent className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
                  <Vote className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold">Wallet Connection Required</p>
                  <p className="text-muted-foreground">
                    Please connect your wallet to create a proposal
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Main Form Card */}
              <Card className="shadow-xl border-0">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl">Proposal Details</CardTitle>
                  <CardDescription>
                    Provide the essential information about your proposal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-semibold">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Increase Treasury Allocation for Q1 Development"
                      maxLength={200}
                      required
                      className="text-base h-12"
                    />
                    <p className="text-sm text-muted-foreground flex items-center justify-between">
                      <span>A clear, concise title that summarizes your proposal</span>
                      <span>{title.length}/200</span>
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-semibold">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your proposal in detail:
• What is the problem or opportunity?
• What is your proposed solution?
• What are the expected benefits?
• What are the potential risks?"
                      rows={12}
                      maxLength={2000}
                      required
                      className="text-base resize-none"
                    />
                    <p className="text-sm text-muted-foreground flex items-center justify-between">
                      <span>Provide enough detail for informed voting</span>
                      <span>{description.length}/2000</span>
                    </p>
                  </div>

                  {/* Duration - Quick Select */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Voting Duration *
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: '24', label: '1 Day' },
                        { value: '72', label: '3 Days' },
                        { value: '168', label: '1 Week' },
                        { value: '336', label: '2 Weeks' },
                      ].map((preset) => (
                        <Button
                          key={preset.value}
                          type="button"
                          variant={duration === preset.value && !showCustomDuration ? 'default' : 'outline'}
                          onClick={() => {
                            setDuration(preset.value);
                            setShowCustomDuration(false);
                          }}
                          className={duration === preset.value && !showCustomDuration ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant={showCustomDuration ? 'default' : 'outline'}
                      onClick={() => setShowCustomDuration(!showCustomDuration)}
                      className={`w-full ${showCustomDuration ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}`}
                    >
                      Custom Duration
                    </Button>
                    {showCustomDuration && (
                      <div className="flex items-center gap-2 pt-2 max-w-xs">
                        <Input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          min="1"
                          max="30"
                          required
                          className="h-10"
                          placeholder="Enter days"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">days</span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {showCustomDuration ? 'Enter 1 to 30 days' : 'Or choose custom duration'}
                    </p>
                  </div>

                  {/* Voting Options */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Vote className="w-4 h-4" />
                      Voting Options *
                    </Label>
                    <RadioGroup value={voteMode} onValueChange={(val) => setVoteMode(val as 'standard' | 'custom')}>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="flex-1 cursor-pointer">
                          <div className="font-medium">Standard Vote</div>
                          <div className="text-sm text-muted-foreground">Yes / No / Abstain (default)</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom" className="flex-1 cursor-pointer">
                          <div className="font-medium">Custom Options</div>
                          <div className="text-sm text-muted-foreground">Define your own voting choices</div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {voteMode === 'custom' && (
                      <div className="space-y-4 pt-2 pl-4 border-l-2 border-purple-200 dark:border-purple-800">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Vote Type</Label>
                          <RadioGroup value={voteType} onValueChange={(val) => setVoteType(val as 'single' | 'multiple')}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="single" id="single" />
                              <Label htmlFor="single" className="cursor-pointer text-sm">
                                Single Choice
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="multiple" id="multiple" />
                              <Label htmlFor="multiple" className="cursor-pointer text-sm">
                                Multiple Choice
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Custom Options</Label>
                          {customOptions.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...customOptions];
                                  newOptions[index] = e.target.value;
                                  setCustomOptions(newOptions);
                                }}
                                placeholder={`Option ${index + 1}`}
                                className="h-10"
                              />
                              {customOptions.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setCustomOptions(customOptions.filter((_, i) => i !== index))}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCustomOptions([...customOptions, ''])}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Advanced Options - Collapsible */}
                  <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <span className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Advanced Options (Optional)
                        </span>
                        {showAdvanced ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 pt-6">
                      <div className="space-y-3">
                        <Label htmlFor="category" className="text-base font-semibold">
                          Category
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="governance">🏛️ Governance</SelectItem>
                            <SelectItem value="treasury">💰 Treasury</SelectItem>
                            <SelectItem value="protocol">🔧 Protocol Upgrade</SelectItem>
                            <SelectItem value="community">👥 Community</SelectItem>
                            <SelectItem value="technical">⚙️ Technical</SelectItem>
                            <SelectItem value="other">📋 Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Help voters find your proposal by categorizing it
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="tags" className="text-base font-semibold">
                          Tags
                        </Label>
                        <Input
                          id="tags"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="e.g., budget, development, community-building"
                          maxLength={100}
                          className="h-10"
                        />
                        <p className="text-sm text-muted-foreground">
                          Comma-separated tags for better discoverability
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Info Banner */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-blue-100 space-y-1">
                      <p className="font-semibold">Privacy-Preserving Voting</p>
                      <p>
                        All votes will be encrypted using Fully Homomorphic Encryption (FHE).
                        Individual votes remain private while results are verifiable on-chain.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Section */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending || isConfirming}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {isPending ? 'Confirming Transaction...' : 'Creating Proposal...'}
                    </>
                  ) : (
                    <>
                      <Vote className="w-5 h-5 mr-2" />
                      Create Proposal
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
