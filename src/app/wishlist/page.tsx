'use client';

import { useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { WishlistItem } from '@/lib/types';
import { WishlistTable } from '@/components/wishlist/wishlist-table';
import { AddWishlistItemDialog } from '@/components/wishlist/wishlist-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [isUserLoading, user, router]);

    const wishlistQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'users', user.uid, 'wishlistItems'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: wishlistItems, isLoading: areItemsLoading } = useCollection<WishlistItem>(wishlistQuery);

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
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-1 text-white">Lista de Desejos</h2>
                            <p className="text-slate-400 text-sm">
                                Itens que seus clientes procuram ({(wishlistItems ?? []).length} de 10).
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <AddWishlistItemDialog items={wishlistItems ?? []} isLoading={areItemsLoading} />
                        </div>
                    </div>
                </div>
                
                <div className="overflow-hidden">
                    <WishlistTable
                        items={wishlistItems ?? []} 
                        isLoading={areItemsLoading}
                    />
                </div>
            </div>
        </div>
    );
}
