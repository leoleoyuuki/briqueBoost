'use client';

import { useState } from 'react';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { WishlistItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Heart, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AddWishlistItemDialogProps {
    items: WishlistItem[];
    isLoading: boolean;
}

const WISHLIST_LIMIT = 10;

export function AddWishlistItemDialog({ items, isLoading }: AddWishlistItemDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [itemName, setItemName] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const limitReached = items.length >= WISHLIST_LIMIT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'Você precisa estar logado.' });
      return;
    }
    if (limitReached) {
        toast({ 
            variant: 'destructive', 
            title: 'Limite Atingido',
            description: `Você só pode ter ${WISHLIST_LIMIT} itens na sua lista de desejos. Remova um item para poder adicionar outro.`
        });
        return;
    }
    setIsSubmitting(true);

    try {
        const wishlistCollection = collection(firestore, 'users', user.uid, 'wishlistItems');
        const newDocRef = doc(wishlistCollection);

        const newItemData = {
            id: newDocRef.id,
            userId: user.uid,
            itemName: itemName,
            customerNotes: customerNotes,
            status: 'Open' as const,
            createdAt: serverTimestamp(),
        };

        setDocumentNonBlocking(newDocRef, newItemData, {});
        
        toast({ title: 'Item adicionado à lista de desejos!' });
        setIsOpen(false);
        setItemName('');
        setCustomerNotes('');
    } catch (error) {
        console.error("Error adding wishlist item:", error);
        toast({ variant: 'destructive', title: 'Erro ao adicionar o item.' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const inputStyle = "bg-slate-800 border-slate-700 rounded-xl h-12 text-base";

  const triggerButton = (
    <Button 
        disabled={limitReached || isLoading}
        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 
                    text-white rounded-xl transition-all duration-200 
                    flex items-center gap-2 font-medium text-sm
                    disabled:bg-slate-700 disabled:cursor-not-allowed">
        <Plus className="w-4 h-4" />
        Adicionar Desejo
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {limitReached ? (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {/* The button is wrapped in a span to make the tooltip work when disabled */}
                        <span tabIndex={0}>{triggerButton}</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <div className="flex items-center gap-2">
                           <AlertCircle className="w-4 h-4 text-amber-400" />
                           <p>Limite de {WISHLIST_LIMIT} itens atingido.</p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ) : (
            triggerButton
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2"><Heart className="text-blue-400" /> Adicionar à Lista de Desejos</DialogTitle>
              <DialogDescription className="text-slate-400">
                Registre um item que um cliente está procurando.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="itemName" className="text-slate-400">
                  Nome do Item
                </Label>
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Ex: Action figure do Batman"
                  required
                  className={inputStyle}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerNotes" className="text-slate-400">
                  Notas do Cliente (opcional)
                </Label>
                <Textarea
                  id="customerNotes"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Ex: Cliente João, ofereceu até R$100."
                  className={`${inputStyle} min-h-[100px]`}
                />
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" type="button" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border-slate-700 text-white rounded-xl transition-all duration-200 font-medium text-sm h-auto">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 font-medium text-sm h-auto">
                    {isSubmitting ? 'Adicionando...' : 'Adicionar Item'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
