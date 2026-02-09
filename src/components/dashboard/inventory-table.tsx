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
import { ArrowUpRight } from "lucide-react";
import Image from 'next/image';

const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export function InventoryTable({ items }: { items: Item[] }) {
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
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={item.name}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={item.imageUrl}
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
