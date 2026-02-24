'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, increment, writeBatch } from 'firebase/firestore';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Trash2 } from 'lucide-react';

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
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteItem = async () => {
    if (!user || !item) return;

    if (item.status === 'Sold') {
        toast({
            variant: 'destructive',
            title: 'Ação não permitida',
            description: 'Não é possível excluir um item que já foi vendido.'
        });
        return;
    }

    setIsDeleting(true);
    const itemRef = doc(firestore, 'users', user.uid, 'items', item.id);
    const userRef = doc(firestore, 'users', user.uid);

    const conditionField = getConditionStockField(item.condition);
    const userUpdate: { [key: string]: any } = {
        itemsInStock: increment(-1),
        totalInvestment: increment(-item.purchasePrice),
    };
    if (conditionField) {
        userUpdate[conditionField] = increment(-1);
    }
    
    let summaryRef;
    let summaryUpdate;
    if (item.purchaseDate?.toDate) {
        const purchaseDate = item.purchaseDate.toDate();
        const purchaseMonthId = format(purchaseDate, 'yyyy-MM');
        summaryRef = doc(firestore, 'users', user.uid, 'monthlySummaries', purchaseMonthId);
        summaryUpdate = {
            totalInvestment: increment(-item.purchasePrice),
        };
    }

    const batch = writeBatch(firestore);
    batch.delete(itemRef);
    batch.update(userRef, userUpdate);
    if (summaryRef && summaryUpdate) {
        batch.update(summaryRef, summaryUpdate);
    }

    try {
        await batch.commit();
        toast({
            title: 'Item excluído!',
            description: 'O item foi removido permanentemente do seu inventário.',
        });
        router.push('/inventory');
    } catch (error) {
        console.error("Error deleting item:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao excluir item',
            description: 'Não foi possível remover o item. Tente novamente.',
        });
    } finally {
        setIsDeleting(false);
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
                                Siga o passo a passo para copiar o link da imagem no seu computador.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 text-slate-300 border border-slate-800 p-4 rounded-lg">
                            <ol className="space-y-3 list-decimal list-inside">
                                <li>Clique com o <strong>botão direito</strong> do mouse sobre a foto do anúncio.</li>
                                <li>No menu que aparecer, selecione <strong>"Copiar endereço da imagem"</strong>.</li>
                                <li>Volte e cole o link aqui.</li>
                            </ol>
                        </div>
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
        <div className="p-6 md:p-8 flex justify-between items-center gap-3 border-t border-slate-800">
          <div>
            {item && (
                <>
                {item.status === 'Sold' ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={0}>
                                    <Button variant="ghost" type="button" className="text-red-500/80 rounded-xl px-4 py-2" disabled>
                                        <Trash2 className="h-4 w-4 mr-2"/>
                                        Excluir
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 border-slate-800 text-slate-300">
                                <p>Itens vendidos não podem ser excluídos.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" type="button" className="text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-xl px-4 py-2" disabled={isDeleting}>
                              <Trash2 className="h-4 w-4 mr-2"/>
                              Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-slate-800">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o item do seu inventário e ajustará suas estatísticas financeiras.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent text-white hover:bg-slate-800 border-slate-700">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteItem} disabled={isDeleting} className="bg-red-600 hover:bg-red-500">
                                    {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                </>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Link href={item ? `/inventory/${item.id}` : '/dashboard'} passHref>
              <Button variant="outline" type="button" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border-slate-700 text-white rounded-xl transition-all duration-200 font-medium text-sm h-auto">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={isLoading || isAuthLoading} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 font-medium text-sm h-auto">
              {isLoading ? (item ? 'Salvando...' : 'Adicionando...') : (item ? 'Salvar Alterações' : 'Adicionar Item')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
