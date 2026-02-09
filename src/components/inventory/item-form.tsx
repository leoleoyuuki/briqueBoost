'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { Item, WithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
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

interface ItemFormProps {
  item?: WithId<Item>;
}

export function ItemForm({ item }: ItemFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: item?.name ?? '',
    purchasePrice: item?.purchasePrice ?? '',
    condition: item?.condition ?? '',
    source: item?.source ?? '',
    initialTitle: item?.initialTitle ?? '',
    initialDescription: item?.initialDescription ?? '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({...prev, condition: value as Item['condition']}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'Você precisa estar logado.'});
        return;
    };
    setIsLoading(true);

    const commonData = {
        name: formData.name,
        purchasePrice: parseFloat(String(formData.purchasePrice)),
        condition: formData.condition,
        source: formData.source,
        initialTitle: formData.initialTitle,
        initialDescription:formData.initialDescription,
    };
    
    try {
        if (item) {
            // Update existing item
            const itemRef = doc(firestore, 'users', user.uid, 'items', item.id);
            updateDocumentNonBlocking(itemRef, commonData);
            toast({ title: 'Item atualizado com sucesso!'});
            router.push(`/inventory/${item.id}`);
        } else {
            // Add new item
            const itemsCollection = collection(firestore, 'users', user.uid, 'items');
            const newItemData = {
                ...commonData,
                userId: user.uid,
                purchaseDate: serverTimestamp(),
                status: 'In Stock' as 'In Stock',
                // Default values for other fields
                salePrice: null,
                enhancedTitle: null,
                enhancedDescription: null,
                reasoning: null,
                dateSold: null,
                platform: '',
                imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
                imageHint: 'new item'
            };
            const docRef = await addDocumentNonBlocking(itemsCollection, {});
            const itemWithId = { ...newItemData, id: docRef.id };
            const newItemRef = doc(firestore, 'users', user.uid, 'items', docRef.id);
            updateDocumentNonBlocking(newItemRef, itemWithId);
            
            toast({ title: 'Item adicionado com sucesso!'});
            router.push('/dashboard');
        }
    } catch (error) {
        console.error("Error saving item:", error);
        toast({ variant: 'destructive', title: 'Erro ao salvar o item.'});
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
                <Input id="name" name="name" placeholder="Ex: Cadeira de Escritório" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchasePrice">Preço de Compra (R$)</Label>
                <Input id="purchasePrice" name="purchasePrice" type="number" step="0.01" placeholder="Ex: 150.00" value={formData.purchasePrice} onChange={handleChange} required />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="condition">Condição</Label>
                  <Select name="condition" value={formData.condition} onValueChange={handleSelectChange}>
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
                  <Input id="source" name="source" placeholder="Ex: Brechó, Amigo, Marketplace" value={formData.source} onChange={handleChange} />
              </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="initialTitle">Título Inicial do Anúncio</Label>
            <Input id="initialTitle" name="initialTitle" placeholder="O título que você usaria" value={formData.initialTitle} onChange={handleChange} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="initialDescription">Descrição Inicial do Anúncio</Label>
            <Textarea id="initialDescription" name="initialDescription" placeholder="Descreva o item, seus detalhes e condição." value={formData.initialDescription} onChange={handleChange} />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Link href={item ? `/inventory/${item.id}` : '/dashboard'} passHref>
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (item ? 'Salvando...' : 'Adicionando...') : (item ? 'Salvar Alterações' : 'Adicionar Item')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
