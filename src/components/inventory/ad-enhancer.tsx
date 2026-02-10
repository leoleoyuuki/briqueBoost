'use client';

import { useState } from 'react';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser, updateDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase';
import type { Item, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { enhanceAdCopyAction } from '@/lib/actions';
import type { GenerateEnhancedAdCopyOutput } from '@/ai/flows/generate-enhanced-ad-copy';
import { Sparkles, Bot, Wand2, Copy, Check, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { isThisMonth } from 'date-fns';

function ResultDisplay({ title, content, onCopy }: { title: string; content: string | null; onCopy: (text: string) => void }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (content) {
            onCopy(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-white">{title}</h4>
                {content && (
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="text-slate-400 hover:bg-slate-800 hover:text-white">
                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">Copiar</span>
                    </Button>
                )}
            </div>
            <div className="text-sm text-slate-300 bg-slate-800/50 p-4 rounded-xl min-h-[80px] whitespace-pre-wrap border border-slate-700">{content}</div>
        </div>
    );
}

export function AdEnhancer({ item }: { item: WithId<Item> }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const [itemDetails, setItemDetails] = useState('');
  const [result, setResult] = useState<GenerateEnhancedAdCopyOutput | null>(item.enhancedTitle ? {
      enhancedTitle: item.enhancedTitle,
      enhancedDescription: item.enhancedDescription ?? '',
      reasoning: item.reasoning ?? ''
  } : null);
  const [isLoading, setIsLoading] = useState(false);
  
  const aiLimit = 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Usuário não encontrado.' });
        return;
    }
    
    let currentUsage = userProfile.aiUsageCount ?? 0;
    const lastReset = userProfile.aiUsageLastReset?.toDate() ?? new Date(0);
    const needsReset = !isThisMonth(lastReset);

    if (needsReset) {
      currentUsage = 0;
    }

    if (currentUsage >= aiLimit) {
        toast({
            variant: 'destructive',
            title: 'Limite de IA atingido',
            description: 'Você atingiu seu limite mensal de 20 usos do assistente de IA.',
        });
        return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await enhanceAdCopyAction({
        initialTitle: item.initialTitle,
        initialDescription: item.initialDescription,
        itemDetails: itemDetails,
      });
      setResult(response);

      // Increment usage on success
      const userRef = doc(firestore, 'users', user.uid);
      if (needsReset) {
          updateDocumentNonBlocking(userRef, { aiUsageCount: 1, aiUsageLastReset: serverTimestamp() });
      } else {
          updateDocumentNonBlocking(userRef, { aiUsageCount: currentUsage + 1 });
      }

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro na Geração',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: 'Copiado!',
        description: 'O texto foi copiado para a área de transferência.',
    });
  };

  const handleUseEnhancedCopy = () => {
    if (!user || !result) return;
    
    const itemRef = doc(firestore, 'users', user.uid, 'items', item.id);
    const updatedData = {
        enhancedTitle: result.enhancedTitle,
        enhancedDescription: result.enhancedDescription,
        reasoning: result.reasoning
    };

    updateDocumentNonBlocking(itemRef, updatedData);

    toast({
        title: 'Anúncio Atualizado!',
        description: 'As versões aprimoradas do título e da descrição foram salvas.',
    });
  };

  const canUseAi = (userProfile?.aiUsageCount ?? 0) < aiLimit;

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl">
      <div className="p-6">
        <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-blue-400" />
            <h2 className="font-headline text-xl font-bold text-white">Assistente de Anúncios IA</h2>
        </div>
        <p className="text-slate-400 mt-1">
          Gere títulos e descrições otimizados para vender mais rápido.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 pt-0 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="itemDetails" className="text-slate-300">Detalhes Adicionais (opcional)</Label>
            <Textarea
              id="itemDetails"
              value={itemDetails}
              onChange={(e) => setItemDetails(e.target.value)}
              placeholder="Ex: Marca, modelo, cor, defeitos, qualidades, acessórios inclusos..."
              className="bg-slate-800 border-slate-700 rounded-xl min-h-[100px]"
            />
            <p className="text-xs text-slate-500">Quanto mais detalhes, melhor será o resultado da IA.</p>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end">
          <Button type="submit" disabled={isLoading || isProfileLoading || !canUseAi}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 flex items-center gap-2 font-medium">
            {isLoading ? (
              <>
                <Bot className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Aprimorar com IA
              </>
            )}
          </Button>
        </div>
      </form>

      {(isLoading || result) && <Separator className="bg-slate-800" />}

      {isLoading && (
          <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/4 bg-slate-800 rounded-md" />
                <Skeleton className="h-20 w-full bg-slate-800 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/4 bg-slate-800 rounded-md" />
                <Skeleton className="h-24 w-full bg-slate-800 rounded-xl" />
              </div>
          </div>
      )}

      {result && (
        <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                 <ResultDisplay title="Título Original" content={item.initialTitle} onCopy={handleCopyToClipboard} />
                 <ResultDisplay title="Título Aprimorado" content={result.enhancedTitle} onCopy={handleCopyToClipboard} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                 <ResultDisplay title="Descrição Original" content={item.initialDescription} onCopy={handleCopyToClipboard} />
                 <ResultDisplay title="Descrição Aprimorada" content={result.enhancedDescription} onCopy={handleCopyToClipboard} />
            </div>
            <div>
                <h4 className="font-semibold mb-2 text-white">💡 Raciocínio da IA</h4>
                <p className="text-sm text-slate-400 border-l-2 border-blue-500 pl-4 italic">{result.reasoning}</p>
            </div>
            <div className="flex justify-end pt-4">
                <Button onClick={handleUseEnhancedCopy} 
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 font-medium text-sm">
                  <Save className="mr-2 h-4 w-4" />
                  Usar estas versões
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
