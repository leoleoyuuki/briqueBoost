'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  BarChart3, 
  Wand2, 
  Heart, 
  ChevronRight, 
  Star, 
  Check,
  TrendingUp,
  Settings,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Users,
  User,
  Percent
} from 'lucide-react';
import { Logo } from '@/components/logo';

const FeatureCard = ({ icon: Icon, title, description, colorClass, iconBgClass }) => (
  <div className="group relative bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm">
    <div className={`w-14 h-14 ${iconBgClass} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon className={`w-7 h-7 ${colorClass}`} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 leading-tight">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
    <div className="mt-6 flex items-center text-sm font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
      Saiba mais <ChevronRight className="w-4 h-4 ml-1" />
    </div>
  </div>
);


export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const individualPlanLink = "https://wa.me/5511957211546?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20a%20assinatura%20do%20BriqueBoost.";
  const resellerPlanLink = "https://wa.me/5511957211546?text=Ol%C3%A1!%20Tenho%20interesse%20em%20adquirir%20assinaturas%20do%20BriqueBoost%20com%20desconto%20para%20revenda.";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/20">
      
      {/* Header */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md py-4 shadow-lg shadow-black/20' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-blue-600 text-white p-1.5 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
              <Logo className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white font-headline">Brique<span className="text-blue-400">Boost</span></span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10 font-medium text-slate-300">
            <a href="#" className="hover:text-blue-400 transition-colors">Início</a>
            <a href="#features" className="hover:text-blue-400 transition-colors">Funcionalidades</a>
            <a href="#planos" className="hover:text-blue-400 transition-colors">Planos</a>
            <a href="#sobre" className="hover:text-blue-400 transition-colors">Sobre</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block font-bold text-slate-300 hover:text-blue-400 transition-colors">Login</Link>
            <Link href="/signup" className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/20">
              Criar Conta
            </Link>
            <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-blue-900/30 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-10 left-[-5%] w-[400px] h-[400px] bg-slate-800/30 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full text-sm font-bold text-blue-400 mb-8 border border-blue-500/20">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              A tecnologia que o seu brique precisava
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-white mb-8">
              Transforme seu Brique em um <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Negócio de Sucesso</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
              A plataforma completa para revendedores que querem organizar o estoque, otimizar anúncios com IA e maximizar o lucro.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
                Criar conta gratuita <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#features" className="w-full sm:w-auto px-10 py-5 bg-slate-800 border border-slate-700 text-white rounded-2xl font-bold text-lg hover:bg-slate-700 transition-colors">
                Ver funcionalidades
              </Link>
            </div>
          </div>

          <div className="relative max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 bg-slate-900 text-white p-6 rounded-[2rem] flex flex-col justify-between h-48 shadow-xl transform md:-rotate-2 border border-slate-800">
              <Settings className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-3xl font-bold">100+</div>
                <div className="text-xs opacity-70 font-medium">Clientes Ativos</div>
              </div>
            </div>
            
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Lucro Estimado</div>
                  <div className="text-3xl font-black text-white">R$ 14.951,00</div>
                </div>
                <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">+12% este mês</div>
              </div>
              <div className="flex items-end gap-2 h-20">
                {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-t-lg transition-all ${i === 6 ? 'bg-blue-500' : 'bg-slate-800 hover:bg-blue-600'}`} style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>

            <div className="md:col-span-1 bg-blue-600 text-white p-6 rounded-[2rem] flex flex-col justify-between h-48 shadow-xl transform md:rotate-2">
              <TrendingUp className="w-8 h-8" />
              <div>
                <div className="text-3xl font-bold">1951+</div>
                <div className="text-xs font-bold opacity-80 uppercase tracking-tighter">Itens Gerenciados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="features" className="py-24 bg-slate-900/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4">Funcionalidades Principais</h2>
              <p className="text-4xl font-black text-white leading-tight">
                Tudo que você precisa para crescer de verdade.
              </p>
            </div>
            <p className="text-slate-400 max-w-sm">
              Deixe a desorganização para trás e foque no que importa: vender mais e melhor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Package}
              title="Controle de Estoque"
              description="Saiba exatamente o que tem, quanto pagou e o que está pronto para venda em um só lugar."
              iconBgClass="bg-blue-500/10"
              colorClass="text-blue-400"
            />
            <FeatureCard 
              icon={BarChart3}
              title="Dashboard Financeiro"
              description="Visualize seu lucro, faturamento e ROI em tempo real. Tome decisões baseadas em dados."
              iconBgClass="bg-indigo-500/10"
              colorClass="text-indigo-400"
            />
            <FeatureCard 
              icon={Wand2}
              title="Assistente IA"
              description="Crie títulos e descrições que vendem sozinhos. Nossa IA otimiza seus anúncios."
              iconBgClass="bg-violet-500/10"
              colorClass="text-violet-400"
            />
            <FeatureCard 
              icon={Heart}
              title="Lista de Desejos"
              description="Anote pedidos de clientes e nunca perca uma oportunidade quando encontrar o item certo."
              iconBgClass="bg-rose-500/10"
              colorClass="text-rose-400"
            />
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-24 bg-slate-950">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Assinatura direta e sem burocracia</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Escolha o plano que melhor se adapta a você e comece a impulsionar suas vendas hoje mesmo.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Card para Usuário Individual */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                    <div className="p-4 bg-blue-500/10 rounded-full mb-4">
                        <User className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Plano Pro Individual</h3>
                    <p className="text-slate-400 mb-6">Acesso completo a todas as ferramentas para você decolar.</p>
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-bold text-white">R$ 29,90</span>
                        <span className="text-sm text-slate-500">/mês</span>
                    </div>
                    <a href={individualPlanLink} target="_blank" rel="noopener noreferrer" className="w-full">
                        <button className="w-full py-4 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all">
                            Assinar via WhatsApp
                        </button>
                    </a>
                </div>

                {/* Card para Revendedores */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                    <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                        <Users className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Plano para Revendedores</h3>
                    <p className="text-slate-400 mb-6">Compre códigos de ativação em lote para seus clientes com um desconto especial.</p>
                    <div className="flex items-center gap-3 mb-8 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                        <Percent className="w-5 h-5 text-emerald-400" />
                        <span className="text-lg font-bold text-emerald-400">50% de Desconto</span>
                    </div>
                    <a href={resellerPlanLink} target="_blank" rel="noopener noreferrer" className="w-full">
                        <button className="w-full py-4 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all">
                            Solicitar para Revenda
                        </button>
                    </a>
                </div>
            </div>
        </div>
    </section>

      {/* Final CTA */}
      <section id="sobre" className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/20">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8">
                Pronto para escalar suas vendas?
              </h2>
              <p className="text-blue-200 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
                Junte-se a centenas de revendedores que estão transformando seu hobby em um negócio lucrativo e organizado.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/signup" className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all hover:scale-105 shadow-xl">
                  Começar Grátis Agora
                </Link>
                <div className="flex items-center gap-2 text-white/90 font-medium">
                  <ShieldCheck className="w-5 h-5" /> Teste sem compromisso
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 text-white p-1 rounded-lg">
                  <Logo className="w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white">Brique<span className="text-blue-400">Boost</span></span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                A tecnologia que faltava para o seu brique. Organize, anuncie e lucre mais com a nossa plataforma.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Navegação</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Funcionalidades</a></li>
                <li><a href="#planos" className="hover:text-blue-400 transition-colors">Planos</a></li>
                <li><a href="#sobre" className="hover:text-blue-400 transition-colors">Sobre</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Suporte</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Newsletter</h4>
              <p className="text-sm text-slate-400 mb-4 font-medium">Dicas de revenda no seu e-mail.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="E-mail" className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button className="bg-slate-800 text-white p-2 rounded-xl hover:bg-slate-700 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} BriqueBoost. O seu sucesso começa aqui.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-blue-400">Termos</a>
              <a href="#" className="hover:text-blue-400">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
