import Link from 'next/link';
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
import type { Item } from "@/lib/types";
import { Inbox, Dot, Package } from "lucide-react";
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';

const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return format(d, 'MMM dd, yyyy');
}

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
                      <TableHead className="text-right">
                          <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} className="border-slate-800">
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
                            <Link href={`/inventory/${item.id}`} passHref>
                                <Button aria-label="View Item" size="sm" variant="outline"
                                 className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white rounded-lg">
                                    Ver
                                </Button>
                            </Link>
                            </TableCell>
                        </TableRow>
                        ))}
                </TableBody>
            </Table>
        ) : (
            renderEmptyState()
        )}
         {isPaginated && items.length > 0 && (
            <div id="inventory-tour-pagination" className="flex items-center justify-end space-x-2 py-4 px-4 border-t border-slate-800">
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
