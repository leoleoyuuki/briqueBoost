'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Package, Percent, ShoppingBag, type LucideIcon } from "lucide-react";
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
    },
    {
      title: "Itens em Estoque",
      icon: Package,
      value: stats.itemsInStock,
      description: "Itens disponíveis para venda",
    },
    {
      title: "Itens Vendidos",
      icon: ShoppingBag,
      value: `+${stats.totalItemsSold}`,
      description: "Total de itens vendidos",
    },
    {
      title: "Margem Média",
      icon: Percent,
      value: formatPercent(stats.averageProfitMargin),
      description: "Margem de lucro média por item",
    },
  ];


  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cardData.map((card) => (
        <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
        </Card>
      ))}
    </div>
  );
}
