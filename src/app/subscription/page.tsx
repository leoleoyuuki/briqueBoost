'use client';

import { useMemo, useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Loader2 } from 'lucide-react';
import { createSubscriptionAction } from '@/lib/mercadopago-actions';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubscribing, setIsSubscribing] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [isUserLoading, user, router]);

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const handleSubscribe = async () => {
        if (!user || !user.email) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Você precisa estar logado para assinar.',
            });
            return;
        }

        setIsSubscribing(true);
        try {
            const result = await createSubscriptionAction({ userEmail: user.email });
            if (result.init_point) {
                // Redirect user to Mercado Pago checkout
                window.location.href = result.init_point;
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao criar assinatura',
                description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
            });
        } finally {
            setIsSubscribing(false);
        }
    };

    const isLoading = isUserLoading || isProfileLoading;

    if (isLoading || !user) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full rounded-3xl bg-slate-900" />
            </div>
        );
    }
    
    const subscriptionStatus = userProfile?.subscriptionStatus ?? 'none';
    const isSubscribed = subscriptionStatus === 'active';

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-2xl font-bold mb-1 text-white">Gerenciar Assinatura</h2>
                    <p className="text-slate-400 text-sm">
                        {isSubscribed 
                            ? "Obrigado por ser um assinante! Você tem acesso a todos os recursos."
                            : "Escolha um plano para desbloquear todo o potencial do BriqueBoost."
                        }
                    </p>
                </div>

                <div className="p-6">
                    {isSubscribed ? (
                        <div className="text-center bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white">Você tem uma assinatura ativa!</h3>
                            <p className="text-slate-400 mt-2">
                               Seu plano atual é o <span className="font-bold text-white">Pro</span>.
                            </p>
                             <Button variant="outline" className="mt-6">Gerenciar no Mercado Pago</Button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-1 gap-6 max-w-md mx-auto">
                           <div className="border-2 border-blue-500 bg-slate-900 rounded-3xl p-6 flex flex-col text-center shadow-2xl shadow-blue-500/10">
                                <div className="mb-4">
                                    <Star className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                    <h3 className="text-2xl font-bold text-white">Plano Pro</h3>
                                    <p className="text-slate-400">Acesso completo à plataforma.</p>
                                </div>
                                <div className="my-6">
                                    <span className="text-5xl font-bold text-white">R$29</span>
                                    <span className="text-slate-400">,90/mês</span>
                                </div>
                                <ul className="space-y-3 text-slate-300 text-left mb-8">
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-400" /> Itens ilimitados</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-400" /> Assistente de Anúncios IA</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-400" /> Relatórios de Performance</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-400" /> Lista de Desejos de Clientes</li>
                                </ul>
                                <Button 
                                    onClick={handleSubscribe} 
                                    disabled={isSubscribing}
                                    className="w-full mt-auto bg-blue-600 hover:bg-blue-500 rounded-xl h-12 text-base font-medium"
                                >
                                    {isSubscribing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Aguarde...
                                        </>
                                    ) : (
                                        'Assinar Agora'
                                    )}
                                </Button>
                           </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
