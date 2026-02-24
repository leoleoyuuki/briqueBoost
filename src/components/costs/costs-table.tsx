'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { OtherCost } from "@/lib/types";
import { Receipt, Trash2 } from "lucide-react";
import { Skeleton } from '../ui/skeleton';
import { format, parseISO } from 'date-fns';
import { Button } from "../ui/button";
import { useFirestore, useUser } from "@/firebase";
import { doc, writeBatch, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
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

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return format(d, 'dd/MM/yyyy');
}

const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const categoryColors: Record<string, string> = {
    'Transporte': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Pedágio': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Alimentação': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Embalagem': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Outros': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

interface CostsTableProps {
    costs: OtherCost[];
    isLoading: boolean;
}

export function CostsTable({ costs, isLoading }: CostsTableProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleDelete = async (cost: OtherCost) => {
        if (!user) return;
        
        const costRef = doc(firestore, 'users', user.uid, 'otherCosts', cost.id);
        const userRef = doc(firestore, 'users', user.uid);
        
        const costDate = cost.date.toDate ? cost.date.toDate() : new Date(cost.date);
        const summaryId = format(costDate, 'yyyy-MM');
        const summaryRef = doc(firestore, 'users', user.uid, 'monthlySummaries', summaryId);

        const batch = writeBatch(firestore);

        // 1. Delete cost document
        batch.delete(costRef);

        // 2. Update user profile
        batch.update(userRef, {
            totalOtherCosts: increment(-cost.amount),
            totalProfit: increment(cost.amount)
        });

        // 3. Update monthly summary
        batch.update(summaryRef, {
            totalOtherCosts: increment(-cost.amount),
            totalProfit: increment(cost.amount)
        });

        try {
            await batch.commit();
            toast({ title: 'Custo removido com sucesso.' });
        } catch (error) {
            console.error('Error deleting cost:', error);
            toast({ variant: 'destructive', title: 'Erro ao remover custo.' });
        }
    };
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center p-12 h-full">
        <Receipt className="h-16 w-16 text-slate-500" />
        <h3 className="text-xl font-semibold mt-4 text-white">Nenhum custo registrado</h3>
        <p className="text-slate-400 mt-2">Adicione seus custos para um controle financeiro preciso.</p>
    </div>
  );

  return (
    <div>
        {isLoading ? (
            <div className="space-y-2 p-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full bg-slate-800 rounded-lg" />
                ))}
            </div>
        ) : costs.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Descrição</TableHead>
                      <TableHead className="hidden sm:table-cell text-slate-400">Categoria</TableHead>
                      <TableHead className="hidden md:table-cell text-slate-400">Data</TableHead>
                      <TableHead className="text-slate-400">Valor</TableHead>
                      <TableHead className="text-right text-slate-400">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {costs.map((cost) => (
                        <TableRow key={cost.id} className="border-slate-800">
                            <TableCell>
                                <div className='font-medium text-white'>{cost.description}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Badge variant='outline' className={categoryColors[cost.category] || categoryColors['Outros']}>
                                    {cost.category}
                                </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-slate-400">{formatDate(cost.date)}</TableCell>
                            <TableCell className="font-medium text-white">{formatCurrency(cost.amount)}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button aria-label="Excluir Custo" size="icon" variant="ghost"
                                            className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg h-8 w-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-900 border-slate-800">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-slate-400">
                                                Esta ação removerá permanentemente este custo. O valor será creditado de volta ao seu lucro líquido.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-transparent text-white hover:bg-slate-800 border-slate-700">Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(cost)} className="bg-red-600 hover:bg-red-500">Excluir</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
            renderEmptyState()
        )}
    </div>
  );
}

    