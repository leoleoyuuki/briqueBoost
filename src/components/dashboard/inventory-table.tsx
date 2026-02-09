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
import { ArrowUpRight, Inbox } from "lucide-react";
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';

const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

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
    <Card className='h-full flex flex-col'>
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline text-lg">{title}</CardTitle>
            <CardDescription>
            {description}
            </CardDescription>
        </div>
        {showViewAll && (
            <Link href="/inventory" passHref>
                <Button variant="outline" size="sm">Ver Todos</Button>
            </Link>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
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
                    <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Lucro</TableHead>
                    <TableHead>
                        <span className="sr-only">Ações</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Image
                                        alt={item.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="40"
                                        src={item.imageUrl ?? `https://picsum.photos/seed/${item.id}/40/40`}
                                        width="40"
                                    />
                                    <div className='font-medium'>{item.name}</div>
                                </div>
                            </TableCell>
                            
                            <TableCell>
                                <Badge variant={item.status === 'Sold' ? 'outline' : 'secondary'}>
                                    {item.status === 'Sold' ? 'Vendido' : 'Em Estoque'}
                                </Badge>
                            </TableCell>
                            <TableCell className={`hidden md:table-cell text-right font-semibold ${item.profit !== null && item.profit !== undefined ? (item.profit >= 0 ? 'text-emerald-600' : 'text-red-600') : 'text-muted-foreground'}`}>
                                {item.status === 'Sold' ? formatCurrency(item.profit) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                            <Link href={`/inventory/${item.id}`} passHref>
                                <Button aria-label="View Item" size="icon" variant="ghost">
                                    <ArrowUpRight className="h-4 w-4" />
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
