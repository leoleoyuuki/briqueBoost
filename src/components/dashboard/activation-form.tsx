'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, KeyRound, LogOut, MessageCircle } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { addMonths } from 'date-fns';

interface ActivationFormProps {
    isExpired?: boolean;
}

export function ActivationForm({ isExpired }: ActivationFormProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const auth = useAuth();
    const router = useRouter();
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
            
            if (!codeSnap.exists() || codeSnap.data()?.isUsed) {
                setError('Código de ativação inválido ou já utilizado.');
                setIsLoading(false);
                return;
            }
            
            const codeData = codeSnap.data();
            const durationInMonths = codeData.durationInMonths as number;

            if (typeof durationInMonths !== 'number' || durationInMonths <= 0) {
                setError('O código de ativação é inválido (duração não especificada).');
                setIsLoading(false);
                return;
            }
            
            const now = new Date();
            // If user's subscription is expired, start new subscription from now.
            // Otherwise, extend the current subscription.
            const userProfileSnap = await getDoc(userRef);
            const userProfile = userProfileSnap.data();
            const currentExpiry = userProfile?.expiresAt?.toDate();
            const startDate = (currentExpiry && currentExpiry > now) ? currentExpiry : now;

            const expirationDate = addMonths(startDate, durationInMonths);

            // Code is valid, perform batch write
            const batch = writeBatch(firestore);

            batch.update(codeRef, {
                isUsed: true,
                usedBy: user.uid,
                usedAt: serverTimestamp()
            });

            batch.update(userRef, {
                accountStatus: 'active',
                activatedAt: serverTimestamp(),
                expiresAt: Timestamp.fromDate(expirationDate)
            });

            await batch.commit();

            toast({
                title: 'Conta Ativada!',
                description: 'Sua conta foi ativada com sucesso. Bem-vindo!',
            });
            // The dashboard will re-render due to the user profile update
        } catch (err: any) {
            console.error("Activation Error:", err);
            if (err.code === 'permission-denied') {
                setError('Você não tem permissão para realizar esta ação.');
            } else {
                setError(err.message || 'Ocorreu um erro ao ativar a conta.');
            }
        } finally {
            setIsLoading(false);
        }
    }
    
    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    const whatsappLink = "https://wa.me/5511957211546?text=Ol%C3%A1%21%20Gostaria%20de%20solicitar%20um%20c%C3%B3digo%20de%20ativa%C3%A7%C3%A3o%20para%20o%20BriqueBoost.";

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 text-center bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl max-w-2xl mx-auto">
            <div className="bg-blue-500/10 p-4 rounded-full mb-6">
                <KeyRound className="h-10 w-10 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
                {isExpired ? 'Seu Acesso Expirou' : 'Ative Sua Conta'}
            </h1>
            <p className="text-slate-400 mb-8">
                {isExpired 
                    ? 'Sua assinatura terminou. Por favor, insira um novo código de ativação para reativar ou estender seu acesso.'
                    : 'Por favor, insira o código de ativação que você recebeu para ter acesso total à plataforma.'
                }
            </p>

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
            
            <Separator className="my-8 bg-slate-800 w-full max-w-sm" />

            <div className="w-full max-w-sm space-y-3">
                 <Button asChild variant="outline" className="w-full h-12 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400 hover:text-emerald-300">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Pedir código no WhatsApp
                    </a>
                </Button>
                <Button onClick={handleLogout} variant="ghost" className="w-full h-12 text-slate-400 hover:text-white hover:bg-slate-800/50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    )
}
