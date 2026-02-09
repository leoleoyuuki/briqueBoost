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

const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export function InventoryTable({ items, isLoading }: { items: Item[]; isLoading: boolean }) {
  
  const renderEmptyState = () => (
    <TableRow>
        <TableCell colSpan={6}>
            <div className="flex flex-col items-center justify-center text-center p-12">
                <Inbox className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mt-4">Nenhum item no inventário</h3>
                <p className="text-muted-foreground mt-2">Comece adicionando um novo item para vê-lo aqui.</p>
                 <Link href="/inventory/new" passHref>
                    <Button className="mt-4">Adicionar Novo Item</Button>
                </Link>
            </div>
        </TableCell>
    </TableRow>
  );
  
  const renderLoadingState = () => (
      Array.from({ length: 4 }).map((_, index) => (
        <TableRow key={`loading-${index}`}>
            <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-16 w-16 rounded-md" />
            </TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
        </TableRow>
      ))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Inventário Recente</CardTitle>
        <CardDescription>
          Uma lista dos seus itens mais recentes em estoque e vendidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Imagem</span>
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Preço de Compra</TableHead>
              <TableHead className="hidden md:table-cell">Preço de Venda</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading 
                ? renderLoadingState()
                : items.length > 0
                    ? items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="hidden sm:table-cell">
                            <Image
                                alt={item.name}
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={item.imageUrl ?? `https://picsum.photos/seed/${item.id}/64/64`}
                                width="64"
                                data-ai-hint={item.imageHint}
                            />
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                            <Badge variant={item.status === 'Sold' ? 'outline' : 'secondary'}>
                                {item.status === 'Sold' ? 'Vendido' : 'Em Estoque'}
                            </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{formatCurrency(item.purchasePrice)}</TableCell>
                            <TableCell className="hidden md:table-cell">{formatCurrency(item.salePrice)}</TableCell>
                            <TableCell>
                            <Link href={`/inventory/${item.id}`} passHref>
                                <Button aria-label="Edit" size="icon" variant="ghost">
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            </TableCell>
                        </TableRow>
                        ))
                    : renderEmptyState()
            }
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
