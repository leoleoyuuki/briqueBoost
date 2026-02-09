import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Item } from '@/lib/types';
import { addNewItem, updateItem } from '@/lib/actions';
import Link from 'next/link';

interface ItemFormProps {
  item?: Item;
}

export function ItemForm({ item }: ItemFormProps) {
  const formAction = item ? updateItem.bind(null, item.id) : addNewItem;

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{item ? 'Editar Item' : 'Adicionar Novo Item'}</CardTitle>
          <CardDescription>
            {item ? 'Atualize os detalhes do seu item.' : 'Preencha os detalhes do item que você adquiriu.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="grid gap-2">
                <Label htmlFor="name">Nome do Item</Label>
                <Input id="name" name="name" placeholder="Ex: Cadeira de Escritório" defaultValue={item?.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchasePrice">Preço de Compra (R$)</Label>
                <Input id="purchasePrice" name="purchasePrice" type="number" step="0.01" placeholder="Ex: 150.00" defaultValue={item?.purchasePrice} required />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="condition">Condição</Label>
                  <Select name="condition" defaultValue={item?.condition}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a condição" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="New">Novo</SelectItem>
                        <SelectItem value="Used - Like New">Usado - Como Novo</SelectItem>
                        <SelectItem value="Used - Good">Usado - Bom</SelectItem>
                        <SelectItem value="Used - Fair">Usado - Razoável</SelectItem>
                        <SelectItem value="For Parts">Para Peças</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="source">Fonte de Aquisição</Label>
                  <Input id="source" name="source" placeholder="Ex: Brechó, Amigo, Marketplace" defaultValue={item?.source} />
              </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="initialTitle">Título Inicial do Anúncio</Label>
            <Input id="initialTitle" name="initialTitle" placeholder="O título que você usaria" defaultValue={item?.initialTitle} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="initialDescription">Descrição Inicial do Anúncio</Label>
            <Textarea id="initialDescription" name="initialDescription" placeholder="Descreva o item, seus detalhes e condição." defaultValue={item?.initialDescription} />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Link href={item ? `/inventory/${item.id}` : '/dashboard'} passHref>
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit">{item ? 'Salvar Alterações' : 'Adicionar Item'}</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
