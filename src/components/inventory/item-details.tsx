'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Item, WithId } from "@/lib/types";
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Pencil } from 'lucide-react';

const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: any) => {
    if (!dateString) return '-';
    // Handle Firestore Timestamp object
    if (dateString.toDate) {
      return dateString.toDate().toLocaleDateString('pt-BR');
    }
    return new Date(dateString).toLocaleDateString('pt-BR');
}

export function ItemDetails({ item }: { item: WithId<Item> }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [salePrice, setSalePrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleConfirmSale = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !salePrice) return;

      setIsSubmitting(true);
      const price = parseFloat(salePrice);
      if (isNaN(price)) {
          toast({ variant: 'destructive', title: 'Preço inválido' });
          setIsSubmitting(false);
          return;
      }

      const itemRef = doc(firestore, 'users', user.uid, 'items', item.id);
      const profit = price - item.purchasePrice;

      const updatedData = {
          status: 'Sold' as const,
          salePrice: price,
          saleDate: serverTimestamp(),
          profit: profit,
      };

      try {
        updateDocumentNonBlocking(itemRef, updatedData);
        toast({
            title: 'Venda Confirmada!',
            description: `O item ${item.name} foi marcado como vendido.`,
        });
        setSalePrice('');
      } finally {
        setIsSubmitting(false);
      }
  };

  const profit = item.status === 'Sold' && item.salePrice ? item.salePrice - item.purchasePrice : null;

  return (
    <Card className="overflow-hidden">
        <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
                <CardDescription>{item.initialTitle}</CardDescription>
              </div>
              <Link href={`/inventory/${item.id}/edit`} passHref>
                <Button variant="outline" size="icon" aria-label="Editar item">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="relative aspect-[4/3] w-full">
                <Image
                    src={item.imageUrl ?? `https://picsum.photos/seed/${item.id}/400/300`}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                    data-ai-hint={item.imageHint}
                />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-medium">Status</p>
                    <Badge variant={item.status === 'Sold' ? 'outline' : 'secondary'}>
                        {item.status === 'Sold' ? 'Vendido' : 'Em Estoque'}
                    </Badge>
                </div>
                <div>
                    <p className="font-medium">Condição</p>
                    <p className="text-muted-foreground">{item.condition}</p>
                </div>
                <div>
                    <p className="font-medium">Preço de Compra</p>
                    <p className="text-muted-foreground">{formatCurrency(item.purchasePrice)}</p>
                </div>
                <div>
                    <p className="font-medium">Preço de Venda</p>
                    <p className="text-muted-foreground">{formatCurrency(item.salePrice)}</p>
                </div>
                 <div>
                    <p className="font-medium">Lucro</p>
                    <p className={`font-semibold ${profit !== null ? (profit > 0 ? 'text-green-600' : 'text-red-600') : 'text-muted-foreground'}`}>
                        {formatCurrency(profit)}
                    </p>
                </div>
                 <div>
                    <p className="font-medium">Data de Adição</p>
                    <p className="text-muted-foreground">{formatDate(item.purchaseDate)}</p>
                </div>
            </div>
        </CardContent>
        {item.status === 'In Stock' && (
            <form onSubmit={handleConfirmSale}>
                <CardFooter className="flex flex-col items-start gap-4 bg-secondary/50 p-4">
                    <h3 className="font-semibold">Marcar como Vendido</h3>
                    <div className="grid w-full gap-2">
                        <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
                        <Input 
                            id="salePrice" 
                            name="salePrice" 
                            type="number" 
                            step="0.01" 
                            placeholder="Ex: 350.00" 
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Confirmando...' : 'Confirmar Venda'}</Button>
                </CardFooter>
            </form>
        )}
    </Card>
  );
}
