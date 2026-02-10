'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, increment } from 'firebase/firestore';
import type { Item, WithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
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
  const { user, isUserLoading: isAuthLoading } = useUser();
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
            const newDocRef = doc(itemsCollection); // Create ref with new ID
            const userRef = doc(firestore, 'users', user.uid);

            const newItemData = {
                ...commonData,
                id: newDocRef.id, // Add ID to document data
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
                imageUrl: `https://picsum.photos/seed/${newDocRef.id}/600/400`,
                imageHint: 'new item'
            };
            
            setDocumentNonBlocking(newDocRef, newItemData, {});
            updateDocumentNonBlocking(userRef, { itemsInStock: increment(1) });
            
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

  const inputStyle = "bg-slate-800 border-slate-700 rounded-xl h-12 text-base";

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl">
        <div className="p-6 md:p-8 border-b border-slate-800">
          <h2 className="font-headline text-xl font-bold text-white">{item ? 'Editar Item' : 'Adicionar Novo Item'}</h2>
          <p className="text-slate-400 mt-1">
            {item ? 'Atualize os detalhes do seu item.' : 'Preencha os detalhes do item que você adquiriu.'}
          </p>
        </div>
        <div className="p-6 md:p-8 grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-400">Nome do Item</Label>
                <Input id="name" name="name" placeholder="Ex: Cadeira de Escritório" value={formData.name} onChange={handleChange} required 
                       className={inputStyle} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchasePrice" className="text-slate-400">Preço de Compra (R$)</Label>
                <Input id="purchasePrice" name="purchasePrice" type="number" step="0.01" placeholder="Ex: 150.00" value={formData.purchasePrice} onChange={handleChange} required 
                       className={inputStyle} />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                  <Label htmlFor="condition" className="text-slate-400">Condição</Label>
                  <Select name="condition" value={formData.condition} onValueChange={handleSelectChange}>
                    <SelectTrigger className={inputStyle}>
                        <SelectValue placeholder="Selecione a condição" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="New">Novo</SelectItem>
                        <SelectItem value="Used - Like New">Usado - Como Novo</SelectItem>
                        <SelectItem value="Used - Good">Usado - Bom</SelectItem>
                        <SelectItem value="Used - Fair">Usado - Razoável</SelectItem>
                        <SelectItem value="For Parts">Para Peças</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="source" className="text-slate-400">Fonte de Aquisição</Label>
                  <Input id="source" name="source" placeholder="Ex: Brechó, Amigo, Marketplace" value={formData.source} onChange={handleChange} 
                         className={inputStyle} />
              </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="initialTitle" className="text-slate-400">Título Inicial do Anúncio</Label>
            <Input id="initialTitle" name="initialTitle" placeholder="O título que você usaria" value={formData.initialTitle} onChange={handleChange} 
                   className={inputStyle} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="initialDescription" className="text-slate-400">Descrição Inicial do Anúncio</Label>
            <Textarea id="initialDescription" name="initialDescription" placeholder="Descreva o item, seus detalhes e condição." value={formData.initialDescription} onChange={handleChange} 
                      className={`${inputStyle} min-h-[100px]`} />
          </div>
        </div>
        <div className="p-6 md:p-8 flex justify-end gap-3 border-t border-slate-800">
          <Link href={item ? `/inventory/${item.id}` : '/dashboard'} passHref>
            <Button variant="outline" type="button" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border-slate-700 text-white rounded-xl transition-all duration-200 font-medium text-sm h-auto">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isLoading || isAuthLoading} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 font-medium text-sm h-auto">
            {isLoading ? (item ? 'Salvando...' : 'Adicionando...') : (item ? 'Salvar Alterações' : 'Adicionar Item')}
          </Button>
        </div>
      </div>
    </form>
  );
}
