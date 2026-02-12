import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, BarChart, Wand2, Heart } from "lucide-react";

const FeatureCard = ({ icon, title, description }: { icon: React.ElementType, title: string, description: string }) => {
  const Icon = icon;
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl flex flex-col items-start gap-4 h-full">
      <div className="bg-blue-500/10 p-3 rounded-lg">
        <Icon className="h-6 w-6 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-slate-400 text-base">{description}</p>
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between h-20 px-4">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold text-white font-headline">
              BriqueBoost
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-base hidden sm:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-500 text-base rounded-xl">
              <Link href="/signup">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 text-center container mx-auto px-4 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-700/30 rounded-full blur-3xl -z-0" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline text-slate-100 tracking-tight">
              Transforme seu Brique em um Negócio de Sucesso
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-400">
              A plataforma completa para revendedores que querem organizar o estoque, otimizar anúncios com IA e maximizar o lucro.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button asChild size="lg" className="h-12 text-lg bg-blue-600 hover:bg-blue-500 rounded-xl px-8">
                <Link href="/signup">Crie sua conta</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-900/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-slate-100">Tudo que você precisa para crescer</h2>
              <p className="mt-4 max-w-xl mx-auto text-lg text-slate-400">
                Deixe a desorganização para trás e foque no que importa: vender mais.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={Package}
                title="Controle de Estoque"
                description="Saiba exatamente o que você tem, quanto pagou e o que está disponível para venda. Tudo em um só lugar."
              />
              <FeatureCard 
                icon={BarChart}
                title="Dashboard Financeiro"
                description="Visualize seu lucro, faturamento e margem de lucro em tempo real. Tome decisões baseadas em dados."
              />
              <FeatureCard 
                icon={Wand2}
                title="Assistente de Anúncios IA"
                description="Crie títulos e descrições que vendem. Nossa IA otimiza seus anúncios para atrair mais compradores."
              />
              <FeatureCard 
                icon={Heart}
                title="Lista de Desejos"
                description="Anote os pedidos dos seus clientes e não perca nenhuma oportunidade de venda quando encontrar o item certo."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl md:text-4xl font-bold font-headline text-slate-100">Pronto para profissionalizar sua revenda?</h2>
                <p className="mt-4 max-w-xl mx-auto text-lg text-slate-400">
                    Junte-se a outros revendedores que estão transformando seu hobby em um negócio lucrativo.
                </p>
                 <div className="mt-10">
                    <Button asChild size="lg" className="h-14 text-xl bg-blue-600 hover:bg-blue-500 rounded-xl px-10">
                        <Link href="/signup">Começar a Vender Mais</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} BriqueBoost. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
