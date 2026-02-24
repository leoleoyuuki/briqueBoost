'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, writeBatch, increment } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Item } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from '../ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Inbox, Dot, Package, Trash2, Edit } from "lucide-react";


const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return format(d, 'MMM dd, yyyy');
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


interface InventoryTableProps {
    items: Item[];
    isLoading: boolean;
    isPaginated?: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    onNextPage?: () => void;
    onPrevPage?: () => void;
}

export function InventoryTable({ 
    items, 
    isLoading,
    isPaginated = false,
    hasNextPage,
    hasPrevPage,
    onNextPage,
    onPrevPage,
}: InventoryTableProps) {
  
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteItem = async (item: Item) => {
    if (!user) return;
    setIsDeleting(true);

    const itemRef = doc(firestore, 'users', user.uid, 'items', item.id);
    const userRef = doc(firestore, 'users', user.uid);
    const batch = writeBatch(firestore);

    try {
        if (item.status === 'Sold') {
            if (!item.salePrice || !item.saleDate) {
                 toast({
                    variant: 'destructive',
                    title: 'Dados Incompletos',
                    description: 'Não é possível excluir um item vendido sem preço ou data de venda.',
                });
                setIsDeleting(false);
                return;
            }

            const salePrice = item.salePrice || 0;
            const profit = item.profit || 0;

            // Reverse user totals
            batch.update(userRef, {
                totalItemsSold: increment(-1),
                totalProfit: increment(-profit),
                totalInvestmentSold: increment(-item.purchasePrice),
                totalRevenue: increment(-salePrice),
            });

            // Reverse monthly summary for sale month
            if (item.saleDate?.toDate) {
                const saleDate = item.saleDate.toDate();
                const saleMonthId = format(saleDate, 'yyyy-MM');
                const summaryRef = doc(firestore, 'users', user.uid, 'monthlySummaries', saleMonthId);
                batch.update(summaryRef, {
                    totalItemsSold: increment(-1),
                    totalProfit: increment(-profit),
                    totalRevenue: increment(-salePrice),
                    totalInvestmentSold: increment(-item.purchasePrice),
                });
            }
        } else { // 'In Stock'
            const conditionField = getConditionStockField(item.condition);
            const userUpdate: { [key: string]: any } = {
                itemsInStock: increment(-1),
                totalInvestment: increment(-item.purchasePrice),
            };
            if (conditionField) {
                userUpdate[conditionField] = increment(-1);
            }
            batch.update(userRef, userUpdate);

            // Reverse monthly summary for purchase month
            if (item.purchaseDate?.toDate) {
                const purchaseDate = item.purchaseDate.toDate();
                const purchaseMonthId = format(purchaseDate, 'yyyy-MM');
                const summaryRef = doc(firestore, 'users', user.uid, 'monthlySummaries', purchaseMonthId);
                batch.update(summaryRef, {
                    totalInvestment: increment(-item.purchasePrice),
                });
            }
        }

        // Delete the item itself
        batch.delete(itemRef);

        await batch.commit();
        toast({
            title: 'Item excluído!',
            description: 'O item foi removido permanentemente.',
        });
    } catch (error) {
        console.error("Error deleting item:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao excluir item',
            description: 'Não foi possível remover o item. Tente novamente.',
        });
    } finally {
        setIsDeleting(false);
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center p-12 h-full">
        <Inbox className="h-16 w-16 text-slate-500" />
        <h3 className="text-xl font-semibold mt-4 text-white">Nenhum item no inventário</h3>
        <p className="text-slate-400 mt-2">Comece adicionando um novo item para vê-lo aqui.</p>
         <Link href="/inventory/new" passHref>
            <Button className="mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 flex items-center gap-2 font-medium text-sm">Adicionar Novo Item</Button>
        </Link>
    </div>
  );

  return (
    <div>
        {isLoading ? (
            <div className="space-y-2 p-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full bg-slate-800 rounded-lg" />
                ))}
            </div>
        ) : items.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Item</TableHead>
                      <TableHead className="hidden sm:table-cell text-slate-400">Preço de Compra</TableHead>
                      <TableHead className="hidden md:table-cell text-slate-400">Data da Compra</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-right text-slate-400">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} className="border-slate-800 cursor-pointer" onClick={() => router.push(`/inventory/${item.id}`)}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {item.imageUrl ? (
                                        <Image
                                            alt={item.name}
                                            className="aspect-square rounded-lg object-cover hidden sm:block"
                                            height="40"
                                            src={item.imageUrl}
                                            width="40"
                                        />
                                    ) : (
                                        <div className="hidden sm:flex aspect-square h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                                            <Package className="h-5 w-5 text-slate-500" />
                                        </div>
                                    )}
                                    <div className='font-medium text-white'>{item.name}</div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-slate-400">{formatCurrency(item.purchasePrice)}</TableCell>
                            <TableCell className="hidden md:table-cell text-slate-400">{formatDate(item.purchaseDate)}</TableCell>
                            <TableCell>
                                <Badge 
                                    variant='outline' 
                                    className={
                                        item.status === 'Sold' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }
                                >
                                    <Dot className='-ml-1 mr-0.5' />
                                    {item.status === 'Sold' ? 'Vendido' : 'Em Estoque'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Link href={`/inventory/${item.id}/edit`} passHref>
                                        <Button aria-label="Editar Item" size="icon" variant="ghost"
                                        className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg h-8 w-8">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button aria-label="Excluir Item" size="icon" variant="ghost"
                                                className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg h-8 w-8">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-slate-900 border-slate-800">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-slate-400">
                                                    {item.status === 'Sold'
                                                        ? 'Esta ação não pode ser desfeita. Excluir um item vendido reverterá o lucro, a receita e as contagens de vendas associadas nos seus relatórios, afetando seus dados históricos.'
                                                        : 'Esta ação não pode ser desfeita. Isso excluirá permanentemente o item e ajustará seus totais de investimento e estoque.'}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="bg-transparent text-white hover:bg-slate-800 border-slate-700">Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteItem(item)} disabled={isDeleting} className="bg-red-600 hover:bg-red-500">
                                                    {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))}
                </TableBody>
            </Table>
        ) : (
            renderEmptyState()
        )}
         {isPaginated && items.length > 0 && (
            <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t border-slate-800">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevPage}
                    disabled={!hasPrevPage || isLoading}
                    className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextPage}
                    disabled={!hasNextPage || isLoading}
                    className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Próximo
                </Button>
            </div>
        )}
    </div>
  );
}
