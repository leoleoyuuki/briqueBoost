'use client';

import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

// --- Components ---

const Logo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.8" />
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FeatureCard = ({ icon: Icon, title, description, colorClass }) => (
  <div className="group relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
    <div className={`w-14 h-14 ${colorClass} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
    <div className="mt-6 flex items-center text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
      Saiba mais <ChevronRight className="w-4 h-4 ml-1" />
    </div>
  </div>
);

const PricingCard = ({ title, price, features, highlighted = false }) => (
  <div className={`p-8 rounded-[2.5rem] flex flex-col ${highlighted ? 'bg-slate-900 text-white scale-105 shadow-2xl z-10 border-2 border-blue-500' : 'bg-slate-50 text-slate-900 border border-slate-200'}`}>
    <div className="mb-8">
      <h3 className="text-lg font-medium opacity-80 mb-2">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold">R$ {price}</span>
        <span className="text-sm opacity-60">/mês</span>
      </div>
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          <div className={`mt-1 p-0.5 rounded-full ${highlighted ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
            <Check className="w-3 h-3" />
          </div>
          <span className="opacity-90">{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-4 rounded-2xl font-bold transition-all ${highlighted ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white border-2 border-slate-200 text-slate-900 hover:border-blue-500 hover:text-blue-600'}`}>
      Começar agora
    </button>
  </div>
);

// --- Main Page ---

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-blue-600 text-white p-1.5 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
              <Logo className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-headline">Brique<span className="text-blue-600">Boost</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 font-medium">
            <a href="#" className="hover:text-blue-600 transition-colors">Início</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Preços</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Sobre</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block font-bold hover:text-blue-600 transition-colors">Login</button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-100">
              Começar Grátis
            </button>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-10 left-[-5%] w-[400px] h-[400px] bg-slate-100 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm font-bold text-blue-700 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              A tecnologia que o seu brique precisava
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 mb-8">
              Transforme seu Brique em um <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Negócio de Sucesso</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
              A plataforma completa para revendedores que querem organizar o estoque, otimizar anúncios com IA e maximizar o lucro.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
                Criar conta gratuita <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors">
                Ver demonstração
              </button>
            </div>
            
            {/* Social Proof */}
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-sm font-bold text-slate-700">4.9/5 de 200+ revendedores reais</span>
              </div>
            </div>
          </div>

          {/* Floating Cards Mockup */}
          <div className="relative max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 bg-slate-900 text-white p-6 rounded-[2rem] flex flex-col justify-between h-48 shadow-xl transform md:-rotate-2">
              <Settings className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-3xl font-bold">100+</div>
                <div className="text-xs opacity-70 font-medium">Clientes Ativos</div>
              </div>
            </div>
            
            <div className="md:col-span-2 bg-white border border-slate-100 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Lucro Estimado</div>
                  <div className="text-3xl font-black text-slate-900">R$ 14.951,00</div>
                </div>
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">+12% este mês</div>
              </div>
              <div className="flex items-end gap-2 h-20">
                {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-t-lg transition-all ${i === 6 ? 'bg-blue-600' : 'bg-slate-100 hover:bg-blue-200'}`} style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>

            <div className="md:col-span-1 bg-blue-600 text-white p-6 rounded-[2rem] flex flex-col justify-between h-48 shadow-xl transform md:rotate-2">
              <TrendingUp className="w-8 h-8" />
              <div>
                <div className="text-3xl font-bold">1951+</div>
                <div className="text-xs font-bold opacity-80 uppercase tracking-tighter">Projetos Gerenciados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="features" className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Funcionalidades Principais</h2>
              <p className="text-4xl font-black text-slate-900 leading-tight">
                Tudo que você precisa para crescer de verdade.
              </p>
            </div>
            <p className="text-slate-500 max-w-sm">
              Deixe a desorganização para trás e foque no que importa: vender mais e melhor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Package}
              title="Controle de Estoque"
              description="Saiba exatamente o que tem, quanto pagou e o que está pronto para venda em um só lugar."
              colorClass="bg-blue-50 text-blue-600"
            />
            <FeatureCard 
              icon={BarChart3}
              title="Dashboard Financeiro"
              description="Visualize seu lucro, faturamento e ROI em tempo real. Tome decisões baseadas em dados."
              colorClass="bg-indigo-50 text-indigo-600"
            />
            <FeatureCard 
              icon={Wand2}
              title="Assistente IA"
              description="Crie títulos e descrições que vendem sozinhos. Nossa IA otimiza seus anúncios."
              colorClass="bg-violet-50 text-violet-600"
            />
            <FeatureCard 
              icon={Heart}
              title="Lista de Desejos"
              description="Anote pedidos de clientes e nunca perca uma oportunidade quando encontrar o item certo."
              colorClass="bg-rose-50 text-rose-600"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Planos para todos os tamanhos</h2>
            <p className="text-slate-500">Escolha o plano ideal para profissionalizar sua revenda hoje.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard 
              title="Starter"
              price="39"
              features={[
                "Até 50 itens no estoque",
                "Dashboard financeiro básico",
                "Suporte via e-mail",
                "1 usuário",
                "Exportação CSV"
              ]}
            />
            <PricingCard 
              highlighted={true}
              title="Professional"
              price="89"
              features={[
                "Estoque ilimitado",
                "IA de anúncios (50/mês)",
                "Lista de desejos inteligente",
                "Suporte prioritário WhatsApp",
                "Multiusuário (até 3)",
                "Relatórios de performance"
              ]}
            />
            <PricingCard 
              title="Enterprise"
              price="199"
              features={[
                "Tudo do Professional",
                "IA de anúncios ilimitada",
                "Consultoria de negócios",
                "Integração com Marketplaces",
                "Usuários ilimitados",
                "Backup em tempo real"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-200">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8">
                Pronto para escalar suas vendas?
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
                Junte-se a centenas de revendedores que estão transformando seu hobby em um negócio lucrativo e organizado.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all hover:scale-105 shadow-xl">
                  Começar Grátis Agora
                </button>
                <div className="flex items-center gap-2 text-white/90 font-medium">
                  <ShieldCheck className="w-5 h-5" /> Teste 14 dias sem compromisso
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 text-white p-1 rounded-lg">
                  <Logo className="w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-900">Brique<span className="text-blue-600">Boost</span></span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                A tecnologia que faltava para o seu brique. Organize, anuncie e lucre mais com a nossa plataforma.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Navegação</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Suporte</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacidade</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Newsletter</h4>
              <p className="text-sm text-slate-500 mb-4 font-medium">Dicas de revenda no seu e-mail.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="E-mail" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400 font-medium">
            <p>© {new Date().getFullYear()} BriqueBoost. O seu sucesso começa aqui.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-blue-600">Termos</a>
              <a href="#" className="hover:text-blue-600">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
