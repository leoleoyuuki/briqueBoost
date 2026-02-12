'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, Timestamp } from 'firebase/firestore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { addMonths, format } from 'date-fns';

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
    const [duration, setDuration] = useState('1');

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
            
            const now = new Date();
            const durationInMonths = parseInt(duration, 10);
            const expiresAt = addMonths(now, durationInMonths);

            await setDoc(codeRef, {
                id: newCode,
                createdAt: Timestamp.fromDate(now),
                durationInMonths: durationInMonths,
                expiresAt: Timestamp.fromDate(expiresAt),
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
                <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Gerador de Códigos de Ativação</h2>
                        <p className="text-slate-400 text-sm">Crie e gerencie códigos de ativação para novos usuários.</p>
                    </div>
                    <div className="flex w-full sm:w-auto items-end gap-4">
                        <div className="grid flex-1 sm:flex-initial sm:w-40 gap-1.5">
                            <Label htmlFor="duration" className="text-slate-400">Duração</Label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger id="duration" className="bg-slate-800 border-slate-700 rounded-xl h-11">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700">
                                    <SelectItem value="1">1 Mês</SelectItem>
                                    <SelectItem value="3">3 Meses</SelectItem>
                                    <SelectItem value="6">6 Meses</SelectItem>
                                    <SelectItem value="12">12 Meses</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleGenerateCode} disabled={isGenerating} className="h-11">
                            <KeySquare className="mr-2 h-4 w-4" />
                            {isGenerating ? 'Gerando...' : 'Gerar'}
                        </Button>
                    </div>
                </div>
                <div>
                     <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-400">Código</TableHead>
                                <TableHead className="text-slate-400">Status</TableHead>
                                <TableHead className="text-slate-400">Duração</TableHead>
                                <TableHead className="text-slate-400">Criado em</TableHead>
                                <TableHead className="text-slate-400">Expira em</TableHead>
                                <TableHead className="text-slate-400">Usado por</TableHead>
                                <TableHead className="text-slate-400">Usado em</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && Array.from({length: 3}).map((_, i) => (
                                <TableRow key={i} className="border-slate-800">
                                    <TableCell colSpan={7} className="py-2">
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
                                        ) : new Date() > code.expiresAt.toDate() ? (
                                            <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 font-medium">
                                                <ShieldX className="h-3.5 w-3.5 mr-1.5" />
                                                Expirado
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                                                <ShieldX className="h-3.5 w-3.5 mr-1.5" />
                                                Disponível
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-400">{code.durationInMonths} {code.durationInMonths > 1 ? 'meses' : 'mês'}</TableCell>
                                    <TableCell className="text-slate-400">{formatDate(code.createdAt)}</TableCell>
                                    <TableCell className="text-slate-400">{formatDate(code.expiresAt)}</TableCell>
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
