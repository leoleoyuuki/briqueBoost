'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
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
import { Plus, Receipt } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function AddCostDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !category || !date) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos obrigatórios.' });
      return;
    }
    setIsSubmitting(true);
    
    const costAmount = parseFloat(amount);
    const costDate = parseISO(date);

    try {
      const costsCollection = collection(firestore, 'users', user.uid, 'otherCosts');
      const newDocRef = doc(costsCollection);
      const userRef = doc(firestore, 'users', user.uid);
      const summaryId = format(costDate, 'yyyy-MM');
      const summaryRef = doc(firestore, 'users', user.uid, 'monthlySummaries', summaryId);
      
      const batch = writeBatch(firestore);

      // 1. Create new cost document
      batch.set(newDocRef, {
        id: newDocRef.id,
        userId: user.uid,
        description: description,
        amount: costAmount,
        category: category,
        date: costDate,
      });

      // 2. Update user profile
      batch.update(userRef, {
        totalOtherCosts: increment(costAmount),
        totalProfit: increment(-costAmount)
      });
      
      // 3. Update monthly summary
      batch.set(summaryRef, {
        id: summaryId,
        year: costDate.getFullYear(),
        month: costDate.getMonth() + 1,
        totalOtherCosts: increment(costAmount),
        totalProfit: increment(-costAmount),
      }, { merge: true });

      await batch.commit();
        
      toast({ title: 'Custo adicionado com sucesso!' });
      setIsOpen(false);
      setDescription('');
      setAmount('');
      setCategory('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    } catch (error) {
        console.error("Error adding cost:", error);
        toast({ variant: 'destructive', title: 'Erro ao adicionar o custo.' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const inputStyle = "bg-slate-800 border-slate-700 rounded-xl h-12 text-base";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 
                          text-white rounded-xl transition-all duration-200 
                          flex items-center gap-2 font-medium text-sm">
            <Plus className="w-4 h-4" />
            Adicionar Custo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2"><Receipt className="text-blue-400" /> Adicionar Novo Custo</DialogTitle>
              <DialogDescription className="text-slate-400">
                Registre uma despesa para manter seus cálculos de lucro precisos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-slate-400">Descrição do Custo</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Gasolina para buscar lote" required className={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="amount" className="text-slate-400">Valor (R$)</Label>
                    <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex: 50.00" required className={inputStyle} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="date" className="text-slate-400">Data</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputStyle} />
                </div>
              </div>
               <div className="grid gap-2">
                    <Label htmlFor="category" className="text-slate-400">Categoria</Label>
                    <Select name="category" value={category} onValueChange={setCategory}>
                        <SelectTrigger className={inputStyle}>
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                            <SelectItem value="Transporte">Transporte</SelectItem>
                            <SelectItem value="Pedágio">Pedágio</SelectItem>
                            <SelectItem value="Alimentação">Alimentação</SelectItem>
                            <SelectItem value="Embalagem">Embalagem</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" type="button" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border-slate-700 text-white rounded-xl transition-all duration-200 font-medium text-sm h-auto">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 font-medium text-sm h-auto">
                    {isSubmitting ? 'Adicionando...' : 'Adicionar Custo'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    