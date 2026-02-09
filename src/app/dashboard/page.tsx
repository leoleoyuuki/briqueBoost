'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { StatCards } from '@/components/dashboard/stat-cards';
import { InventoryTable } from '@/components/dashboard/inventory-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

function calculateStats(items: Item[] | null) {
    if (!items) {
        return { totalProfit: 0, itemsInStock: 0, averageProfitMargin: 0, totalItemsSold: 0 };
    }
    const soldItems = items.filter(item => item.status === 'Sold' && item.salePrice !== null);
    const totalProfit = soldItems.reduce((acc, item) => acc + (item.salePrice! - item.purchasePrice), 0);
    const itemsInStock = items.filter(item => item.status === 'In Stock').length;
    const totalPurchasePriceOfSoldItems = soldItems.reduce((acc, item) => acc + item.purchasePrice, 0);
    const averageProfitMargin = totalPurchasePriceOfSoldItems > 0
        ? totalProfit / totalPurchasePriceOfSoldItems
        : 0;

    return {
        totalProfit,
        itemsInStock,
        averageProfitMargin,
        totalItemsSold: soldItems.length,
    }
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const itemsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'items');
    }, [firestore, user]);

    const { data: items, isLoading: areItemsLoading } = useCollection<Item>(itemsQuery);

    const stats = useMemo(() => calculateStats(items), [items]);

    if (isUserLoading) {
        return (
             <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }
    
    if (!user) {
        router.push('/');
        return null;
    }


    return (
        <div className="space-y-8">
            <StatCards stats={stats} />
            <InventoryTable items={items ?? []} isLoading={areItemsLoading} />
        </div>
    );
}
