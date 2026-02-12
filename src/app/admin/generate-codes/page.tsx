'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { ActivationCode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, KeySquare, ShieldCheck, ShieldX } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Helper function to generate a random code
function generateCode() {
    return 'BB-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  try {
    return format(d, 'MMM dd, yyyy, h:mm a');
  } catch (e) {
    return '-';
  }
}

function CopyableCode({ code }: { code: string }) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast({ title: 'Código copiado!' });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{code}</span>
            <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
        </div>
    );
}

export default function GenerateCodesPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const codesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'activationCodes'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: codes, isLoading } = useCollection<ActivationCode>(codesQuery);

    const handleGenerateCode = async () => {
        if (!user) return;
        setIsGenerating(true);
        try {
            const newCode = generateCode();
            const codeRef = doc(firestore, 'activationCodes', newCode);
            
            // Using setDoc directly with await as setDocumentNonBlocking doesn't return a promise to await
            await setDoc(codeRef, {
                id: newCode,
                createdAt: serverTimestamp(),
                isUsed: false,
                usedBy: null,
                usedAt: null,
            });

            toast({ title: 'Novo código de ativação gerado!', description: newCode });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro ao gerar código.' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Gerador de Códigos de Ativação</h2>
                        <p className="text-slate-400 text-sm">Crie e gerencie códigos de ativação para novos usuários.</p>
                    </div>
                    <Button onClick={handleGenerateCode} disabled={isGenerating}>
                        <KeySquare className="mr-2 h-4 w-4" />
                        {isGenerating ? 'Gerando...' : 'Gerar Novo Código'}
                    </Button>
                </div>
                <div>
                     <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-400">Código</TableHead>
                                <TableHead className="text-slate-400">Status</TableHead>
                                <TableHead className="text-slate-400">Criado em</TableHead>
                                <TableHead className="text-slate-400">Usado por</TableHead>
                                <TableHead className="text-slate-400">Usado em</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && Array.from({length: 3}).map((_, i) => (
                                <TableRow key={i} className="border-slate-800">
                                    <TableCell colSpan={5} className="py-2">
                                        <div className="h-8 animate-pulse rounded-md bg-slate-800" />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {codes && codes.map(code => (
                                <TableRow key={code.id} className="border-slate-800">
                                    <TableCell>
                                        <CopyableCode code={code.id} />
                                    </TableCell>
                                    <TableCell>
                                        {code.isUsed ? (
                                             <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                 <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                                                 Utilizado
                                             </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                                                <ShieldX className="h-3.5 w-3.5 mr-1.5" />
                                                Disponível
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-400">{formatDate(code.createdAt)}</TableCell>
                                    <TableCell className="text-slate-400 font-mono text-xs">{code.usedBy || '-'}</TableCell>
                                    <TableCell className="text-slate-400">{formatDate(code.usedAt)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
