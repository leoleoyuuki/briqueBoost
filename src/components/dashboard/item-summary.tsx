'use client'

import type { Item } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";
import { Skeleton } from "../ui/skeleton";


const itemConditions = ["New", "Used - Like New", "Used - Good", "Used - Fair", "For Parts"];
const conditionTranslations: { [key: string]: string } = {
    "New": "Novo",
    "Used - Like New": "Usado - Como Novo",
    "Used - Good": "Usado - Bom",
    "Used - Fair": "Usado - Razoável",
    "For Parts": "Para Peças"
};

export function ItemSummary({ items, isLoading }: { items: Item[] | null, isLoading: boolean }) {

    const summaryData = useMemo(() => {
        if (!items) return null;

        const totalItems = items.length;
        if (totalItems === 0) return [];
        
        const conditionCounts = items.reduce((acc, item) => {
            acc[item.condition] = (acc[item.condition] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return itemConditions.map(condition => ({
            name: conditionTranslations[condition],
            value: conditionCounts[condition] || 0,
            percentage: totalItems > 0 ? ((conditionCounts[condition] || 0) / totalItems) * 100 : 0,
        })).filter(d => d.value > 0);

    }, [items]);

    if (isLoading) {
        return (
            <Card className="h-full bg-card">
                <CardHeader>
                    <Skeleton className="h-6 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full flex flex-col bg-card">
            <CardHeader>
                <CardTitle className="font-semibold text-lg text-foreground">Items por Condição</CardTitle>
            </CardHeader>
            <CardContent>
                {summaryData && summaryData.length > 0 ? (
                    <div className="space-y-4">
                        {summaryData.map(data => (
                            <div key={data.name} className="space-y-1">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{data.name}</span>
                                    <span>{data.value}</span>
                                </div>
                                <Progress value={data.percentage} className="h-2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Nenhum item para exibir.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
