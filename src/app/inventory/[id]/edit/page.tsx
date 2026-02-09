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

  if (isUserLoading || isItemLoading || !user) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  if (!item) {
    notFound();
    return null;
  }

  return <ItemForm item={item} />;
}
