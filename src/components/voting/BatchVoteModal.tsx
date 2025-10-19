// Modal for voting on a proposal
import { useState } from "react";
import { CheckCircle, XCircle, MinusCircle, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Proposal, VoteChoice } from "@/types/proposal";
import { toast } from "@/hooks/use-toast";
import { useBatchVote } from "@/hooks/useBatchVote";

interface BatchVoteModalProps {
  is_open: boolean;
  on_close: () => void;
  slate_id: bigint;
  proposals: Proposal[];
}

export function BatchVoteModal({
  is_open,
  on_close,
  slate_id,
  proposals
}: BatchVoteModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { submitBatchVote, isEncrypting, isConfirming } = useBatchVote();

  // Handle vote choice selection - only one option can be selected
  const handleChoice = (optionIndex: number) => {
    setSelectedOption(selectedOption === optionIndex ? null : optionIndex);
  };

  // Submit vote
  const submitVote = async () => {
    if (selectedOption === null) {
      toast({
        title: "No vote selected",
        description: "Please select an option before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      // Pass the selected option index directly (0-based)
      await submitBatchVote([Number(slate_id)], [selectedOption]);

      toast({
        title: "Vote submitted successfully! 🎉",
        description: "Your vote has been encrypted and recorded on-chain",
      });

      setSelectedOption(null);
      on_close();
    } catch (error) {
      toast({
        title: "Vote submission failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const isSubmitting = isEncrypting || isConfirming;

  return (
    <Dialog open={is_open} onOpenChange={on_close}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cast Your Vote</DialogTitle>
          <DialogDescription>
            Select your choice. Your vote will be encrypted before submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {proposals.map((proposal, index) => (
            <Button
              key={proposal.id}
              variant={selectedOption === index ? "default" : "outline"}
              size="lg"
              onClick={() => handleChoice(index)}
              disabled={isSubmitting}
              className="w-full justify-start text-left h-auto py-4"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{proposal.title}</div>
                  {proposal.description && proposal.description !== `Option ${index + 1}` && (
                    <div className="text-sm opacity-80 mt-1">{proposal.description}</div>
                  )}
                </div>
                {selectedOption === index && (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                )}
              </div>
            </Button>
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-auto">
            <Lock className="w-4 h-4" />
            <span>Vote is encrypted client-side</span>
          </div>
          <Button variant="outline" onClick={on_close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={submitVote} disabled={isSubmitting || selectedOption === null}>
            {isEncrypting ? "Encrypting..." : isConfirming ? "Confirming..." : "Submit Vote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
