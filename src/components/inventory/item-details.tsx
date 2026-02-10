'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Item, WithId } from "@/lib/types";
import { useUser, useFirestore, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp, increment } from 'firebase/firestore';
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
import { Pencil, Dot } from 'lucide-react';
import { format } from 'date-fns';

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

const getConditionStockField = (condition: Item['condition']): string | null => {
    switch (condition) {
        case 'New': return 'itemsInStockNew';
        case 'Used - Like New': return 'itemsInStockUsedLikeNew';
        case 'Used - Good': return 'itemsInStockUsedGood';
        case 'Used - Fair': return 'itemsInStockUsedFair';
        case 'For Parts': return 'itemsInStockForParts';
        default: return null;
    }
};

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
      const userRef = doc(firestore, 'users', user.uid);
      const profit = price - item.purchasePrice;

      const updatedItemData = {
          status: 'Sold' as const,
          salePrice: price,
          saleDate: serverTimestamp(),
          profit: profit,
      };
      
      const conditionField = getConditionStockField(item.condition);
      const updatedUserData: { [key: string]: any } = {
        itemsInStock: increment(-1),
        totalItemsSold: increment(1),
        totalProfit: increment(profit),
        totalInvestmentSold: increment(item.purchasePrice),
      };
      if (conditionField) {
        updatedUserData[conditionField] = increment(-1);
      }
      
      // Update monthly summary
      const saleDate = new Date();
      const saleMonthId = format(saleDate, 'yyyy-MM');
      const summaryRef = doc(firestore, 'users', user.uid, 'monthlySummaries', saleMonthId);
      const summaryData = {
          id: saleMonthId,
          year: saleDate.getFullYear(),
          month: saleDate.getMonth() + 1,
          totalProfit: increment(profit),
          totalItemsSold: increment(1),
      };


      try {
        // Update documents
        updateDocumentNonBlocking(itemRef, updatedItemData);
        updateDocumentNonBlocking(userRef, updatedUserData);
        setDocumentNonBlocking(summaryRef, summaryData, { merge: true });

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
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-headline text-xl font-bold text-white">{item.name}</h2>
                <p className="text-slate-400">{item.initialTitle}</p>
              </div>
              <Link href={`/inventory/${item.id}/edit`} passHref>
                <Button variant="outline" size="icon" aria-label="Editar item" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
            </div>
        </div>
        <div className="p-6 space-y-6">
            <div className="relative aspect-[4/3] w-full">
                <Image
                    src={item.imageUrl ?? `https://picsum.photos/seed/${item.id}/400/300`}
                    alt={item.name}
                    fill
                    className="object-cover rounded-2xl"
                    data-ai-hint={item.imageHint}
                />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 text-sm">
                <div>
                    <p className="font-medium text-slate-400">Status</p>
                     <Badge 
                        variant='outline' 
                        className={`mt-1 ${
                            item.status === 'Sold' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                    >
                        <Dot className='-ml-1 mr-0.5' />
                        {item.status === 'Sold' ? 'Vendido' : 'Em Estoque'}
                    </Badge>
                </div>
                <div>
                    <p className="font-medium text-slate-400">Condição</p>
                    <p className="text-slate-200 font-medium">{item.condition}</p>
                </div>
                <div>
                    <p className="font-medium text-slate-400">Preço de Compra</p>
                    <p className="text-slate-200 font-medium">{formatCurrency(item.purchasePrice)}</p>
                </div>
                <div>
                    <p className="font-medium text-slate-400">Preço de Venda</p>
                    <p className="text-slate-200 font-medium">{formatCurrency(item.salePrice)}</p>
                </div>
                 <div>
                    <p className="font-medium text-slate-400">Lucro</p>
                    <p className={`font-semibold ${profit !== null ? (profit > 0 ? 'text-emerald-400' : 'text-red-400') : 'text-slate-200'}`}>
                        {formatCurrency(profit)}
                    </p>
                </div>
                 <div>
                    <p className="font-medium text-slate-400">Data de Adição</p>
                    <p className="text-slate-200 font-medium">{formatDate(item.purchaseDate)}</p>
                </div>
            </div>
        </div>
        {item.status === 'In Stock' && (
            <form onSubmit={handleConfirmSale}>
                <div className="flex flex-col items-start gap-4 bg-slate-900 p-6 border-t border-slate-800">
                    <h3 className="font-semibold text-white">Marcar como Vendido</h3>
                    <div className="grid w-full gap-2">
                        <Label htmlFor="salePrice" className="text-slate-400">Preço de Venda (R$)</Label>
                        <Input 
                            id="salePrice" 
                            name="salePrice" 
                            type="number" 
                            step="0.01" 
                            placeholder="Ex: 350.00" 
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            required
                            className="bg-slate-800 border-slate-700 rounded-xl h-11"
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 rounded-xl h-11 px-6">
                        {isSubmitting ? 'Confirmando...' : 'Confirmar Venda'}
                    </Button>
                </div>
            </form>
        )}
    </div>
  );
}
