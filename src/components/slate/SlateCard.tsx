// Slate card component for grid display
import { Link } from "react-router-dom";
import { Clock, Users, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slate } from "@/types/proposal";
import { format_time_remaining } from "@/lib/utils";

interface SlateCardProps {
  slate: Slate;
}

export function SlateCard({ slate }: SlateCardProps) {
  const time_remaining = slate.is_active 
    ? format_time_remaining(Number(slate.voting_end_time))
    : "Ended";

  return (
    <Link to={`/slate/${slate.id}`}>
      <Card className="group relative overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-primary cursor-pointer h-full">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {slate.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {slate.proposals.length} proposals
              </p>
            </div>
            <Badge 
              variant={slate.is_active ? "default" : "secondary"}
              className={slate.is_active ? "bg-primary" : ""}
            >
              {slate.is_active ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              {slate.is_active ? "Active" : "Ended"}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {slate.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{time_remaining}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{slate.total_votes} votes</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
