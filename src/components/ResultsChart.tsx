import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultsChartProps {
  votesFor: bigint;
  votesAgainst: bigint;
  votesAbstain: bigint;
  title?: string;
}

export function ResultsChart({ votesFor, votesAgainst, votesAbstain, title = 'Voting Results' }: ResultsChartProps) {
  const { forPercent, againstPercent, abstainPercent, total } = useMemo(() => {
    const total = Number(votesFor + votesAgainst + votesAbstain);
    return total === 0 ? { forPercent: 0, againstPercent: 0, abstainPercent: 0, total: 0 } : {
      forPercent: (Number(votesFor) / total) * 100,
      againstPercent: (Number(votesAgainst) / total) * 100,
      abstainPercent: (Number(votesAbstain) / total) * 100,
      total
    };
  }, [votesFor, votesAgainst, votesAbstain]);

  const barData = [
    { label: 'For', value: Number(votesFor), percent: forPercent, color: 'bg-green-500' },
    { label: 'Against', value: Number(votesAgainst), percent: againstPercent, color: 'bg-red-500' },
    { label: 'Abstain', value: Number(votesAbstain), percent: abstainPercent, color: 'bg-gray-400' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Total votes: {total}</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-center text-muted-foreground py-8">No votes yet</p>
        ) : (
          <div className="space-y-6">
            {/* Bar Chart */}
            <div className="space-y-3">
              {barData.map(({ label, value, percent, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">{value} ({percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pie Chart (CSS-based) */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* For segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="20"
                    strokeDasharray={`${forPercent * 2.51} 251.2`}
                    strokeDashoffset="0"
                  />
                  {/* Against segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="20"
                    strokeDasharray={`${againstPercent * 2.51} 251.2`}
                    strokeDashoffset={`-${forPercent * 2.51}`}
                  />
                  {/* Abstain segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="rgb(156, 163, 175)"
                    strokeWidth="20"
                    strokeDasharray={`${abstainPercent * 2.51} 251.2`}
                    strokeDashoffset={`-${(forPercent + againstPercent) * 2.51}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 text-sm">
              {barData.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
