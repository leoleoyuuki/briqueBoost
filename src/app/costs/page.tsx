'use client';

import { useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { OtherCost } from '@/lib/types';
import { CostsTable } from '@/components/costs/costs-table';
import { AddCostDialog } from '@/components/costs/add-cost-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function CostsPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [isUserLoading, user, router]);

    const costsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'users', user.uid, 'otherCosts'), orderBy('date', 'desc'));
    }, [firestore, user]);

    const { data: costs, isLoading: areCostsLoading } = useCollection<OtherCost>(costsQuery);

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
                            <h2 className="text-2xl font-bold mb-1 text-white">Outros Custos</h2>
                            <p className="text-slate-400 text-sm">
                                Gerencie seus custos operacionais para um cálculo de lucro preciso.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <AddCostDialog />
                        </div>
                    </div>
                </div>
                
                <div className="overflow-hidden">
                    <CostsTable
                        costs={costs ?? []} 
                        isLoading={areCostsLoading}
                    />
                </div>
            </div>
        </div>
    );
}

    