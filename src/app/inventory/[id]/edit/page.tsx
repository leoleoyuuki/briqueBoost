'use client';

import { useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { Item } from '@/lib/types';
import { ItemForm } from '@/components/inventory/item-form';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditItemPage() {
  const params = useParams<{ id: string }>();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const itemRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid, 'items', params.id);
  }, [firestore, user, params.id]);

  const { data: item, isLoading: isItemLoading } = useDoc<Item>(itemRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [isUserLoading, user, router]);

  const renderSkeleton = () => (
    <div>
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8">
            <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-12 w-full bg-slate-800 rounded-xl" />
                    <Skeleton className="h-12 w-full bg-slate-800 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-12 w-full bg-slate-800 rounded-xl" />
                    <Skeleton className="h-12 w-full bg-slate-800 rounded-xl" />
                </div>
                <Skeleton className="h-12 w-full bg-slate-800 rounded-xl" />
                <Skeleton className="h-24 w-full bg-slate-800 rounded-xl" />
            </div>
        </div>
    </div>
  );

  if (isUserLoading || isItemLoading || !user) {
    return renderSkeleton();
  }

  if (!item) {
    notFound();
    return null;
  }

  return (
    <div>
      <ItemForm item={item} />
    </div>
  );
}
