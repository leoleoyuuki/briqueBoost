'use client';

import { useMemo, useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, startAfter, endBefore, limitToLast, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { InventoryTable } from '@/components/dashboard/inventory-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';

const PAGE_SIZE = 10;

export default function InventoryPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const [page, setPage] = useState(1);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [firstDoc, setFirstDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [isNextPage, setIsNextPage] = useState(true);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [isUserLoading, user, router]);

    const itemsQuery = useMemoFirebase(() => {
        if (!user) return null;
        const baseQuery = collection(firestore, 'users', user.uid, 'items');
        
        if (isNextPage) {
            const constraints = [orderBy('purchaseDate', 'desc'), limit(PAGE_SIZE)];
            if (lastDoc) {
                constraints.splice(1, 0, startAfter(lastDoc));
            }
            return query(baseQuery, ...constraints);
        } else {
             const constraints = [orderBy('purchaseDate', 'desc'), endBefore(firstDoc), limitToLast(PAGE_SIZE)];
             return query(baseQuery, ...constraints);
        }
    }, [firestore, user, lastDoc, firstDoc, isNextPage]);

    const { data: items, isLoading: areItemsLoading, snapshots } = useCollection<Item>(itemsQuery);

    const handleNextPage = () => {
        if (snapshots && snapshots.length === PAGE_SIZE) {
            setLastDoc(snapshots[snapshots.length - 1]);
            setFirstDoc(snapshots[0]);
            setPage(p => p + 1);
            setIsNextPage(true);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setLastDoc(null); // This will be tricky, let's simplify for now
            setFirstDoc(firstDoc);
            setPage(p => p - 1);
            setIsNextPage(false);
        }
    };

    const hasNextPage = snapshots ? snapshots.length === PAGE_SIZE : false;
    const hasPrevPage = page > 1;

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
                                Itens no seu inventário (Página {page})
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
                        items={items ?? []} 
                        isLoading={areItemsLoading}
                        isPaginated={true}
                        hasNextPage={hasNextPage}
                        hasPrevPage={hasPrevPage}
                        onNextPage={handleNextPage}
                        onPrevPage={handlePrevPage}
                    />
                </div>
            </div>
        </div>
    );
}
