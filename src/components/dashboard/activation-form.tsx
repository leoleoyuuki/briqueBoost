'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, KeyRound } from "lucide-react";


export function ActivationForm() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleActivation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !code) return;
        setIsLoading(true);
        setError(null);

        const codeRef = doc(firestore, 'activationCodes', code);
        const userRef = doc(firestore, 'users', user.uid);

        try {
            const codeSnap = await getDoc(codeRef);
            const codeData = codeSnap.data();

            if (!codeSnap.exists() || codeData?.isUsed) {
                setError('Código de ativação inválido ou já utilizado.');
                setIsLoading(false);
                return;
            }

            if (codeData.expiresAt && codeData.expiresAt.toDate() < new Date()) {
                setError('Este código de ativação expirou.');
                setIsLoading(false);
                return;
            }

            // Code is valid and unused, perform batch write
            const batch = writeBatch(firestore);

            batch.update(codeRef, {
                isUsed: true,
                usedBy: user.uid,
                usedAt: serverTimestamp()
            });

            batch.update(userRef, {
                accountStatus: 'active',
                activatedAt: serverTimestamp()
            });

            await batch.commit();

            toast({
                title: 'Conta Ativada!',
                description: 'Sua conta foi ativada com sucesso. Bem-vindo!',
            });
            // The dashboard will re-render due to the user profile update
        } catch (err: any) {
            console.error(err);
            if (err.code === 'permission-denied') {
                setError('Você não tem permissão para usar este código.');
            } else {
                setError(err.message || 'Ocorreu um erro ao ativar a conta.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 text-center bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl max-w-2xl mx-auto">
            <div className="bg-blue-500/10 p-4 rounded-full mb-6">
                <KeyRound className="h-10 w-10 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Ative Sua Conta</h1>
            <p className="text-slate-400 mb-8">Por favor, insira o código de ativação que você recebeu para ter acesso total à plataforma.</p>

            <form onSubmit={handleActivation} className="w-full max-w-sm space-y-4">
                {error && (
                    <Alert variant="destructive">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Erro na Ativação</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="grid gap-2 text-left">
                    <Label htmlFor="activation-code" className="text-slate-400">Código de Ativação</Label>
                    <Input
                        id="activation-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Insira seu código aqui"
                        required
                        className="bg-slate-800 border-slate-700 rounded-xl h-12 text-center text-lg tracking-widest font-mono"
                    />
                </div>
                <Button type="submit" disabled={isLoading || !code} className="w-full h-12 text-base">
                    {isLoading ? 'Ativando...' : 'Ativar Conta'}
                </Button>
            </form>
        </div>
    )
}
