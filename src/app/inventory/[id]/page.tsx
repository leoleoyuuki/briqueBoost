'use client';

import { useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { Item } from '@/lib/types';
import { AdEnhancer } from '@/components/inventory/ad-enhancer';
import { ItemDetails } from '@/components/inventory/item-details';
import { Skeleton } from '@/components/ui/skeleton';

export default function ItemDetailPage({ params }: { params: { id: string } }) {
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

  if (isUserLoading || isItemLoading || !user) {
    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
                 <Skeleton className="h-[600px] w-full" />
            </div>
            <div className="lg:col-span-2">
                <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
    );
  }

  if (!item) {
    notFound();
    return null;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
            <ItemDetails item={item} />
        </div>
        <div className="lg:col-span-2">
            <AdEnhancer item={item} />
        </div>
    </div>
  );
}
