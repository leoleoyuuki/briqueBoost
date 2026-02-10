'use client';

import { useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { InventoryTable } from '@/components/dashboard/inventory-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';

export default function InventoryPage() {
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
            return dateB.getTime() - a.purchaseDate.toDate().getTime();
        });
    }, [items]);

    if (isUserLoading || !user) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <Skeleton className="h-[600px] w-full rounded-3xl bg-slate-900" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-1 text-white">Inventário Completo</h2>
                            <p className="text-slate-400 text-sm">
                                {sortedItems.length} {sortedItems.length === 1 ? 'item no total' : 'itens no total'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 
                                                text-white rounded-xl transition-all duration-200 
                                                flex items-center gap-2 font-medium text-sm">
                                <Download className="w-4 h-4" />
                                Exportar
                            </button>
                            <Link href="/inventory/new">
                                <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 
                                                    text-white rounded-xl transition-all duration-200 
                                                    flex items-center gap-2 font-medium text-sm">
                                    <Plus className="w-4 h-4" />
                                    Adicionar Item
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                
                <div className="overflow-hidden">
                    <InventoryTable 
                        items={sortedItems} 
                        isLoading={areItemsLoading}
                    />
                </div>
            </div>
        </div>
    );
}
