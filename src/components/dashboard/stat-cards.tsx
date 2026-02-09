'use client';

import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardsProps = {
  stats: {
    totalProfit: number;
    itemsInStock: number;
    averageProfitMargin: number;
    totalItemsSold: number;
  };
};

interface CardData {
  title: string;
  value: string | number;
}

export function StatCards({ stats }: StatCardsProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
  };

  const cardData: CardData[] = [
    {
      title: "Lucro Total",
      value: formatCurrency(stats.totalProfit),
    },
    {
      title: "Itens Vendidos",
      value: stats.totalItemsSold,
    },
    {
      title: "Itens em Estoque",
      value: stats.itemsInStock,
    },
    {
      title: "Margem Média",
      value: `${(stats.averageProfitMargin * 100).toFixed(1)}%`,
    },
  ];

  const renderPercentageChange = () => {
    // This is a placeholder as we don't have historical data to compare.
    const mockChange = (Math.random() * 20 - 5).toFixed(2);
    const isPositive = parseFloat(mockChange) >= 0;
    
    return (
        <div className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            isPositive ? "text-emerald-500" : "text-red-500"
        )}>
            <span className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full",
                isPositive ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
            )}>
                {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            </span>
            <span>
                {isPositive ? '+' : ''}{mockChange}%
            </span>
        </div>
    );
  };

  return (
    <Card className="bg-card/50 backdrop-blur-md border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
            {cardData.map((card) => (
                <div key={card.title} className="p-6">
                    <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                    <div className="mt-2 text-3xl font-bold text-foreground">
                        {card.value}
                    </div>
                    <div className="mt-2">
                        {renderPercentageChange()}
                    </div>
                </div>
            ))}
        </div>
    </Card>
  );
}