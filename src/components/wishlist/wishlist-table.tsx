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
import type { WishlistItem } from "@/lib/types";
import { Heart, CheckCircle, Archive, Trash2 } from "lucide-react";
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import { Button } from "../ui/button";
import { useFirestore, useUser, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return format(d, 'MMM dd, yyyy');
}

const statusConfig: Record<WishlistItem['status'], { icon: React.FC<any>; label: string; className: string; }> = {
    'Open': { icon: Heart, label: 'Aberto', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'Found': { icon: CheckCircle, label: 'Encontrado', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    'Archived': { icon: Archive, label: 'Arquivado', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
};

interface WishlistTableProps {
    items: WishlistItem[];
    isLoading: boolean;
}

export function WishlistTable({ items, isLoading }: WishlistTableProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleDelete = (itemId: string) => {
        if (!user) return;
        const itemRef = doc(firestore, 'users', user.uid, 'wishlistItems', itemId);
        deleteDocumentNonBlocking(itemRef);
        toast({ title: 'Item removido da lista de desejos.' });
    };

    const handleStatusChange = (itemId: string, newStatus: WishlistItem['status']) => {
        if (!user) return;
        const itemRef = doc(firestore, 'users', user.uid, 'wishlistItems', itemId);
        updateDocumentNonBlocking(itemRef, { status: newStatus });
        toast({ title: `Status do item atualizado para "${statusConfig[newStatus].label}".` });
    }
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center p-12 h-full">
        <Heart className="h-16 w-16 text-slate-500" />
        <h3 className="text-xl font-semibold mt-4 text-white">Sua lista de desejos está vazia</h3>
        <p className="text-slate-400 mt-2">Adicione itens que seus clientes procuram para não perder oportunidades.</p>
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
        ) : items.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Item Desejado</TableHead>
                      <TableHead className="hidden sm:table-cell text-slate-400">Notas do Cliente</TableHead>
                      <TableHead className="hidden md:table-cell text-slate-400">Data</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-right text-slate-400">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => {
                        const currentStatus = statusConfig[item.status];
                        return (
                            <TableRow key={item.id} className="border-slate-800">
                                <TableCell>
                                    <div className='font-medium text-white'>{item.itemName}</div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-slate-400 max-w-xs truncate">{item.customerNotes || '-'}</TableCell>
                                <TableCell className="hidden md:table-cell text-slate-400">{formatDate(item.createdAt)}</TableCell>
                                <TableCell>
                                    <Badge 
                                        variant='outline' 
                                        className={currentStatus.className}
                                    >
                                        <currentStatus.icon className='-ml-1 mr-1.5 h-3.5 w-3.5' />
                                        {currentStatus.label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {item.status === 'Open' && (
                                         <Button aria-label="Marcar como Encontrado" size="sm" variant="outline"
                                            className="bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400 rounded-lg"
                                            onClick={() => handleStatusChange(item.id, 'Found')} >
                                             <CheckCircle className="h-4 w-4 mr-2" /> Encontrado
                                         </Button>
                                    )}
                                    {item.status !== 'Archived' && (
                                         <Button aria-label="Arquivar" size="sm" variant="outline"
                                            className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300 rounded-lg"
                                            onClick={() => handleStatusChange(item.id, 'Archived')} >
                                             <Archive className="h-4 w-4" />
                                         </Button>
                                    )}
                                    <Button aria-label="Deletar Item" size="icon" variant="ghost"
                                        className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                        onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        ) : (
            renderEmptyState()
        )}
    </div>
  );
}
