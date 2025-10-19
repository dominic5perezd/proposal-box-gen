// Horizontal bar chart for vote results
import { VoteResult } from "@/types/proposal";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";

interface VoteChartProps {
  result: VoteResult;
}

export function VoteChart({ result }: VoteChartProps) {
  const { for_votes, against_votes, abstain_votes, total_votes } = result;

  // Calculate percentages
  const for_percent = total_votes > 0 ? (for_votes / total_votes) * 100 : 0;
  const against_percent = total_votes > 0 ? (against_votes / total_votes) * 100 : 0;
  const abstain_percent = total_votes > 0 ? (abstain_votes / total_votes) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* For votes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="font-medium">For</span>
          </div>
          <span className="text-muted-foreground">
            {for_votes.toLocaleString()} ({for_percent.toFixed(1)}%)
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
            style={{ width: `${for_percent}%` }}
          />
        </div>
      </div>

      {/* Against votes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="font-medium">Against</span>
          </div>
          <span className="text-muted-foreground">
            {against_votes.toLocaleString()} ({against_percent.toFixed(1)}%)
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-destructive transition-all duration-500"
            style={{ width: `${against_percent}%` }}
          />
        </div>
      </div>

      {/* Abstain votes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MinusCircle className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Abstain</span>
          </div>
          <span className="text-muted-foreground">
            {abstain_votes.toLocaleString()} ({abstain_percent.toFixed(1)}%)
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-muted-foreground/50 transition-all duration-500"
            style={{ width: `${abstain_percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
