'use client';

import { useState } from 'react';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser, updateDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase';
import type { Item, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
                <h4 className="font-semibold">{title}</h4>
                {content && (
                    <Button variant="ghost" size="icon" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">Copiar</span>
                    </Button>
                )}
            </div>
            <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md min-h-[60px] whitespace-pre-wrap">{content}</p>
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            <CardTitle className="font-headline text-xl">Assistente de Anúncios IA</CardTitle>
        </div>
        <CardDescription>
          Gere títulos e descrições otimizados para vender mais rápido.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="itemDetails">Detalhes Adicionais (opcional)</Label>
            <Textarea
              id="itemDetails"
              value={itemDetails}
              onChange={(e) => setItemDetails(e.target.value)}
              placeholder="Ex: Marca, modelo, cor, defeitos, qualidades, acessórios inclusos..."
            />
            <p className="text-xs text-muted-foreground">Quanto mais detalhes, melhor será o resultado da IA.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading || isProfileLoading || !canUseAi}>
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
        </CardFooter>
      </form>

      {(isLoading || result) && <Separator className="my-4" />}

      {isLoading && (
          <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-24 w-full" />
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
                <h4 className="font-semibold mb-2">💡 Raciocínio da IA</h4>
                <p className="text-sm text-muted-foreground border-l-2 border-accent pl-3 italic">{result.reasoning}</p>
            </div>
            <div className="flex justify-end pt-4">
                <Button onClick={handleUseEnhancedCopy} variant="secondary">
                  <Save className="mr-2 h-4 w-4" />
                  Usar estas versões
                </Button>
            </div>
        </div>
      )}
    </Card>
  );
}
