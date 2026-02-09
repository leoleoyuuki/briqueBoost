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
import { PlusCircle } from 'lucide-react';

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
            return dateB.getTime() - dateA.getTime();
        });
    }, [items]);

    if (isUserLoading || !user) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Inventário</h1>
                    <Skeleton className="h-10 w-40" />
                </div>
                <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Inventário</h1>
                <Link href="/inventory/new" passHref>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Novo Item
                    </Button>
                </Link>
            </div>
            <InventoryTable items={sortedItems} isLoading={areItemsLoading} />
        </div>
    );
}
