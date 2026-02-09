import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Item } from "@/lib/types";
import { ArrowUpRight, MoreHorizontal, Inbox, Dot } from "lucide-react";
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
    title?: string;
    description?: string;
    showViewAll?: boolean;
}

export function InventoryTable({ 
    items, 
    isLoading, 
    title = "Inventário", 
    description = "Uma lista dos seus itens em estoque e vendidos.",
    showViewAll = false
}: InventoryTableProps) {
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center p-12 h-full">
        <Inbox className="h-16 w-16 text-muted-foreground/50" />
        <h3 className="text-xl font-semibold mt-4">Nenhum item no inventário</h3>
        <p className="text-muted-foreground mt-2">Comece adicionando um novo item para vê-lo aqui.</p>
         <Link href="/inventory/new" passHref>
            <Button className="mt-4">Adicionar Novo Item</Button>
        </Link>
    </div>
  );

  return (
    <Card className='h-full flex flex-col bg-card'>
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle className="font-semibold text-lg text-foreground">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </div>
        {/* Actions like download or re-issue can go here */}
      </CardHeader>
      <CardContent className="flex-grow p-0">
        {isLoading ? (
            <div className="space-y-2 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : items.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Item</TableHead>
                      <TableHead className="hidden sm:table-cell">Preço de Compra</TableHead>
                      <TableHead className="hidden md:table-cell">Data da Compra</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">
                          <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} className="border-t border-border hover:bg-muted/50">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Image
                                        alt={item.name}
                                        className="aspect-square rounded-md object-cover hidden sm:block"
                                        height="40"
                                        src={item.imageUrl ?? `https://picsum.photos/seed/${item.id}/40/40`}
                                        width="40"
                                    />
                                    <div className='font-medium text-foreground'>{item.name}</div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">{formatCurrency(item.purchasePrice)}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(item.purchaseDate)}</TableCell>
                            <TableCell>
                                <Badge 
                                    variant='outline' 
                                    className={
                                        item.status === 'Sold' 
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    }
                                >
                                    <Dot className='-ml-1 mr-0.5' />
                                    {item.status === 'Sold' ? 'Vendido' : 'Em Estoque'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <Link href={`/inventory/${item.id}`} passHref>
                                <Button aria-label="View Item" size="sm" variant="outline">
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
      </CardContent>
    </Card>
  );
}
