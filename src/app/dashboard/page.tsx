'use client';

import { useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { StatCards } from '@/components/dashboard/stat-cards';
import { InventoryTable } from '@/components/dashboard/inventory-table';
import { ProfitChart } from '@/components/dashboard/profit-chart';
import { ItemSummary } from '@/components/dashboard/item-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [isUserLoading, user, router]);

    const itemsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'items');
    }, [firestore, user]);

    const { data: items, isLoading: areItemsLoading } = useCollection<Item>(itemsQuery);

    const sortedItems = useMemo(() => {
        if (!items) return [];
        return [...items].sort((a, b) => {
            const dateA = a.purchaseDate?.toDate() ?? 0;
            const dateB = b.purchaseDate?.toDate() ?? 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateB.getTime() - dateA.getTime();
        });
    }, [items]);

    const stats = useMemo(() => {
        if (!items) {
            return { totalProfit: 0, itemsInStock: 0, averageProfitMargin: 0, totalItemsSold: 0 };
        }
        const soldItems = items.filter(item => item.status === 'Sold' && typeof item.salePrice === 'number');
        const totalProfit = soldItems.reduce((acc, item) => acc + (item.profit ?? (item.salePrice! - item.purchasePrice)), 0);
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
    }, [items]);

    if (isUserLoading || !user) {
        return (
             <div className="space-y-6">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-40 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <Skeleton className="lg:col-span-3 h-[450px] rounded-xl" />
                    <Skeleton className="lg:col-span-2 h-[450px] rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <StatCards stats={stats} />
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
              <div className="lg:col-span-3">
                  <ProfitChart items={items} isLoading={areItemsLoading} />
              </div>
              <div className="lg:col-span-2">
                 <ItemSummary items={items} isLoading={areItemsLoading}/>
              </div>
            </div>
             <div>
                <InventoryTable 
                    items={sortedItems} 
                    isLoading={areItemsLoading} 
                    title="Histórico de Transações" 
                    description="Uma lista de todos os seus itens."
                />
            </div>
        </div>
    );
}
