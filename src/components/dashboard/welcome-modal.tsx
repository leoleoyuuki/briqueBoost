'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Sparkles, TrendingUp, Heart, Package } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const benefits = [
  {
    icon: Package,
    text: 'Controle seu estoque de forma simples e visual.',
  },
  {
    icon: TrendingUp,
    text: 'Entenda seu lucro, faturamento e margem em tempo real.',
  },
  {
    icon: Sparkles,
    text: 'Crie anúncios otimizados com o poder da Inteligência Artificial.',
  },
  {
    icon: Heart,
    text: 'Nunca mais perca uma venda com a Lista de Desejos de clientes.',
  },
];

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
        <DialogHeader className="items-center text-center space-y-4">
          <div className="bg-blue-500/10 p-4 rounded-full">
             <Logo className="h-10 w-10 text-blue-400" />
          </div>
          <DialogTitle className="font-headline text-3xl text-slate-100">Bem-vindo ao BriqueBoost!</DialogTitle>
          <DialogDescription className="text-slate-400 text-base">
            Estamos felizes em ter você aqui. Veja como vamos transformar sua revenda:
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <ul className="space-y-4">
            {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                    <li key={index} className="flex items-start gap-4">
                        <div className="bg-slate-800 p-2 rounded-lg mt-0.5">
                           <Icon className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-slate-300 text-base">{benefit.text}</span>
                    </li>
                );
            })}
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-500 rounded-xl">
            Vamos Começar!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
