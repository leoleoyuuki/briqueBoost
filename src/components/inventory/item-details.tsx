import type { Item } from "@/lib/types";
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

const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
}

export function ItemDetails({ item }: { item: Item }) {
  return (
    <Card className="overflow-hidden">
        <CardHeader>
            <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
            <CardDescription>{item.initialTitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="relative aspect-[4/3] w-full">
                <Image
                    src={item.imageUrl}
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
                    <p className={`font-semibold ${item.salePrice ? (item.salePrice - item.purchasePrice > 0 ? 'text-green-600' : 'text-red-600') : 'text-muted-foreground'}`}>
                        {item.salePrice ? formatCurrency(item.salePrice - item.purchasePrice) : '-'}
                    </p>
                </div>
                 <div>
                    <p className="font-medium">Data de Adição</p>
                    <p className="text-muted-foreground">{formatDate(item.dateAdded)}</p>
                </div>
            </div>
        </CardContent>
        {item.status === 'In Stock' && (
            <CardFooter className="flex flex-col items-start gap-4 bg-secondary/50 p-4">
                <h3 className="font-semibold">Marcar como Vendido</h3>
                <div className="grid w-full gap-2">
                    <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
                    <Input id="salePrice" name="salePrice" type="number" step="0.01" placeholder="Ex: 350.00" />
                </div>
                <Button>Confirmar Venda</Button>
            </CardFooter>
        )}
    </Card>
  );
}
