'use client'

import type { UserProfile } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";
import { Skeleton } from "../ui/skeleton";

const conditionTranslations: { [key: string]: string } = {
    "itemsInStockNew": "Novo",
    "itemsInStockUsedLikeNew": "Usado - Como Novo",
    "itemsInStockUsedGood": "Usado - Bom",
    "itemsInStockUsedFair": "Usado - Razoável",
    "itemsInStockForParts": "Para Peças"
};

const conditionOrder = [
    "itemsInStockNew",
    "itemsInStockUsedLikeNew",
    "itemsInStockUsedGood",
    "itemsInStockUsedFair",
    "itemsInStockForParts"
];

export function ItemSummary({ userProfile, isLoading }: { userProfile: UserProfile | null, isLoading: boolean }) {

    const summaryData = useMemo(() => {
        if (!userProfile) return null;

        const totalItems = userProfile.itemsInStock ?? 0;
        if (totalItems === 0) return [];
        
        return conditionOrder.map(key => {
            const value = (userProfile as any)[key] ?? 0;
            return {
                name: conditionTranslations[key],
                value: value,
                percentage: totalItems > 0 ? (value / totalItems) * 100 : 0,
            }
        }).filter(d => d.value > 0);

    }, [userProfile]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full bg-slate-800" />
                <Skeleton className="h-8 w-full bg-slate-800" />
                <Skeleton className="h-8 w-full bg-slate-800" />
                <Skeleton className="h-8 w-full bg-slate-800" />
            </div>
        )
    }

    return (
        <>
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
                <div className="flex items-center justify-center h-full text-muted-foreground py-10">
                    <p>Nenhum item em estoque.</p>
                </div>
            )}
        </>
    );
}
