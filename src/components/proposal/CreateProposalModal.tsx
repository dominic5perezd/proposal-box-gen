import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CreateProposalModal() {
  const { isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('24');

  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    const durationInSeconds = Number(duration) * 3600;

    if (durationInSeconds < 3600 || durationInSeconds > 2592000) {
      toast.error('Duration must be between 1 hour and 30 days');
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'createProposal',
        args: [title, description, BigInt(durationInSeconds)],
      });

      setTxHash(hash);
      toast.success('Proposal created successfully!', {
        description: `Transaction: ${hash.slice(0, 10)}...`,
      });

      setTitle('');
      setDescription('');
      setDuration('24');
      setOpen(false);
    } catch (error: any) {
      console.error('Failed to create proposal:', error);
      toast.error('Failed to create proposal', {
        description: error.message || 'Please check network and wallet balance',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!isConnected}>
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter proposal title"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Proposal Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the proposal content, goals, and expected outcomes"
              rows={6}
              maxLength={2000}
              required
            />
            <p className="text-sm text-muted-foreground">
              {description.length}/2000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Voting Duration (hours) *</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              max="720"
              required
            />
            <p className="text-sm text-muted-foreground">
              Minimum 1 hour, maximum 30 days (720 hours)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isConfirming}
              className="flex-1"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? 'Confirming...' : 'Creating...'}
                </>
              ) : (
                'Create Proposal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
