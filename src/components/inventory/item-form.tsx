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
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { HelpCircle, Smartphone, Monitor } from 'lucide-react';

interface ItemFormProps {
  item?: WithId<Item>;
}

const getConditionStockField = (condition: string): string | null => {
    switch (condition) {
        case 'New': return 'itemsInStockNew';
        case 'Used - Like New': return 'itemsInStockUsedLikeNew';
        case 'Used - Good': return 'itemsInStockUsedGood';
        case 'Used - Fair': return 'itemsInStockUsedFair';
        case 'For Parts': return 'itemsInStockForParts';
        default: return null;
    }
};

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
    imageUrl: item?.imageUrl ?? '',
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
        imageUrl: formData.imageUrl || null,
    };
    
    try {
        if (item) {
            // Update existing item
            const itemRef = doc(firestore, 'users', user.uid, 'items', item.id);
            // Note: If condition changes, we should adjust counters. This is a more complex scenario.
            // For now, we assume condition is not editable or handle it separately.
            updateDocumentNonBlocking(itemRef, commonData);
            toast({ title: 'Item atualizado com sucesso!'});
            router.push(`/inventory/${item.id}`);
        } else {
            // Add new item
            const itemsCollection = collection(firestore, 'users', user.uid, 'items');
            const newDocRef = doc(itemsCollection); // Create ref with new ID
            const userRef = doc(firestore, 'users', user.uid);
            const purchasePrice = parseFloat(String(formData.purchasePrice));

            const newItemData = {
                ...commonData,
                id: newDocRef.id, // Add ID to document data
                userId: user.uid,
                purchaseDate: serverTimestamp(),
                status: 'In Stock' as const,
                salePrice: null,
                enhancedTitle: null,
                enhancedDescription: null,
                reasoning: null,
                dateSold: null,
                platform: '',
                imageHint: null,
            };
            
            const conditionField = getConditionStockField(formData.condition);
            const userUpdateData: { [key: string]: any } = { 
                itemsInStock: increment(1),
                totalInvestment: increment(purchasePrice),
            };
            if (conditionField) {
                userUpdateData[conditionField] = increment(1);
            }

            // Add monthly summary update for investment
            const purchaseDate = new Date();
            const summaryId = format(purchaseDate, 'yyyy-MM');
            const summaryRef = doc(firestore, 'users', user.uid, 'monthlySummaries', summaryId);
            const summaryData = {
                id: summaryId,
                year: purchaseDate.getFullYear(),
                month: purchaseDate.getMonth() + 1,
                totalInvestment: increment(purchasePrice),
                // Initialize other fields to ensure they can be incremented later
                totalProfit: increment(0),
                totalItemsSold: increment(0),
                totalRevenue: increment(0),
                totalInvestmentSold: increment(0),
            };
            
            setDocumentNonBlocking(newDocRef, newItemData, {});
            updateDocumentNonBlocking(userRef, userUpdateData);
            setDocumentNonBlocking(summaryRef, summaryData, { merge: true });
            
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
            <div className="flex items-center justify-between">
                <Label htmlFor="imageUrl" className="text-slate-400">Link da Imagem (opcional)</Label>
                <Dialog>
                    <DialogTrigger asChild>
                        <button type="button" className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            <HelpCircle className="h-4 w-4" />
                            Como copiar?
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Como Copiar o Link da Imagem</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Siga o passo a passo para o Facebook Marketplace no seu dispositivo.
                            </DialogDescription>
                        </DialogHeader>
                         <Tabs defaultValue="mobile" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                                <TabsTrigger value="mobile" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                                    <Smartphone className="mr-2 h-4 w-4" />Celular
                                </TabsTrigger>
                                <TabsTrigger value="desktop" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                                    <Monitor className="mr-2 h-4 w-4" />Computador
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="mobile" className="mt-4 text-slate-300 border border-slate-800 p-4 rounded-lg">
                                <ol className="space-y-3 list-decimal list-inside">
                                    <li>Abra a foto do anúncio no app do Facebook.</li>
                                    <li>Toque no ícone de três pontos (⋮) no canto superior direito.</li>
                                    <li>No menu, selecione a opção <strong>"Copiar link"</strong>.</li>
                                    <li>Volte e cole o link aqui.</li>
                                </ol>
                            </TabsContent>
                            <TabsContent value="desktop" className="mt-4 text-slate-300 border border-slate-800 p-4 rounded-lg">
                                <ol className="space-y-3 list-decimal list-inside">
                                    <li>Clique com o <strong>botão direito</strong> do mouse sobre a foto do anúncio.</li>
                                    <li>No menu que aparecer, selecione <strong>"Copiar endereço da imagem"</strong>.</li>
                                    <li>Volte e cole o link aqui.</li>
                                </ol>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </div>
            <Input id="imageUrl" name="imageUrl" placeholder="Cole o link da imagem do anúncio" value={formData.imageUrl ?? ''} onChange={handleChange} 
                   className={inputStyle} />
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
