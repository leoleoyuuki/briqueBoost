'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Package, TrendingUp, ShoppingBag, type LucideIcon } from "lucide-react";
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
  icon: LucideIcon;
  value: string | number;
  description: string;
  isPrimary?: boolean;
}

export function StatCards({ stats }: StatCardsProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatPercent = (value: number) => {
    // Placeholder for change, since we don't have historical data
    const mockChange = (Math.random() * 10 - 2).toFixed(2);
    const isPositive = parseFloat(mockChange) >= 0;
    return (
        <span className={cn('text-xs font-medium', isPositive ? 'text-emerald-500' : 'text-red-500')}>
            {isPositive ? '+' : ''}{mockChange}%
        </span>
    );
  };

  const cardData: CardData[] = [
    {
      title: "Lucro Total",
      icon: DollarSign,
      value: formatCurrency(stats.totalProfit),
      description: "Comparado ao mês passado",
      isPrimary: true,
    },
    {
      title: "Itens Vendidos",
      icon: ShoppingBag,
      value: `+${stats.totalItemsSold}`,
      description: "Comparado ao mês passado",
    },
    {
      title: "Itens em Estoque",
      icon: Package,
      value: stats.itemsInStock,
      description: "Itens disponíveis para venda",
    },
    {
      title: "Margem Média",
      icon: TrendingUp,
      value: `${(stats.averageProfitMargin * 100).toFixed(1)}%`,
      description: "Comparado ao mês passado",
    },
  ];


  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card) => (
        <Card 
            key={card.title} 
            className={cn(
                'bg-card text-card-foreground shadow-sm', 
                card.isPrimary && 'bg-gradient-to-br from-purple-600 to-violet-800 text-white'
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn("text-sm font-medium", card.isPrimary ? 'text-white/80' : 'text-muted-foreground')}>{card.title}</CardTitle>
                <card.icon className={cn("h-5 w-5", card.isPrimary ? 'text-white/80' : 'text-muted-foreground')} />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <div className="flex items-center gap-2 text-xs">
                    {!card.isPrimary && formatPercent(0)}
                    <p className={cn("text-xs", card.isPrimary ? 'text-white/80' : 'text-muted-foreground')}>{card.description}</p>
                </div>
            </CardContent>
        </Card>
      ))}
    </div>
  );
}
