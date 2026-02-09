'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Package, Percent, ShoppingBag, type LucideIcon } from "lucide-react";

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
  color: string;
}

export function StatCards({ stats }: StatCardsProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const cardData: CardData[] = [
    {
      title: "Lucro Total",
      icon: DollarSign,
      value: formatCurrency(stats.totalProfit),
      description: "Lucro de todos os itens vendidos",
      color: "hsl(var(--chart-1))",
    },
    {
      title: "Itens em Estoque",
      icon: Package,
      value: stats.itemsInStock,
      description: "Itens disponíveis para venda",
      color: "hsl(var(--chart-2))",
    },
    {
      title: "Itens Vendidos",
      icon: ShoppingBag,
      value: `+${stats.totalItemsSold}`,
      description: "Total de itens vendidos",
      color: "hsl(var(--chart-3))",
    },
    {
      title: "Margem Média",
      icon: Percent,
      value: formatPercent(stats.averageProfitMargin),
      description: "Margem de lucro média por item",
      color: "hsl(var(--chart-4))",
    },
  ];


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card) => (
        <Card
            key={card.title}
            className="relative"
          >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ backgroundColor: card.color }} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-5">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4" style={{ color: card.color }}/>
          </CardHeader>
          <CardContent className="pl-5">
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
