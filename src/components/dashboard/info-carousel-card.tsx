'use client';

import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Lightbulb, Wand2, Copy, TrendingUp, ArrowUpRight } from 'lucide-react';

const tips = [
  {
    icon: Wand2,
    color: 'text-blue-400',
    title: 'Aprimore seus anúncios com IA',
    description: 'Use nosso assistente para gerar títulos e descrições que vendem mais.',
  },
  {
    icon: Copy,
    color: 'text-emerald-400',
    title: 'Copie com um clique',
    description: 'Transfira os textos gerados pela IA para seus anúncios facilmente.',
  },
  {
    icon: TrendingUp,
    color: 'text-orange-400',
    title: 'Visão financeira clara',
    description: 'Acompanhe seu faturamento bruto, investimento e lucro líquido em tempo real.',
  },
  {
    icon: Lightbulb,
    color: 'text-yellow-400',
    title: 'Organize seus desejos',
    description: 'Anote o que seus clientes procuram na Lista de Desejos para não perder vendas.',
  },
];

export function InfoCarouselCard() {
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));

  return (
    <div
      className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                   rounded-3xl p-6 relative overflow-hidden group hover:bg-slate-900/70 
                   transition-all duration-300 h-full flex flex-col"
    >
      <div
        className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl 
                       group-hover:bg-purple-500/20 transition-all duration-300"
      />

      <div className="relative flex-1 flex flex-col">
        <Carousel
          plugins={[plugin.current]}
          className="w-full flex-1"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.play}
        >
          <CarouselContent className="-mt-1">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <CarouselItem key={index} className="pt-1">
                  <div className="flex flex-col justify-center h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-slate-800 rounded-2xl">
                        <Icon className={`w-6 h-6 ${tip.color}`} />
                      </div>
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-lg font-bold mb-2 text-slate-100">{tip.title}</p>
                    <p className="text-sm text-slate-400">
                        {tip.description}
                    </p>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
