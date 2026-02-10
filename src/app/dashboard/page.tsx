'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { StatCards } from '@/components/dashboard/stat-cards';
import { InventoryTable } from '@/components/dashboard/inventory-table';
import { ProfitChart } from '@/components/dashboard/profit-chart';
import { ItemSummary } from '@/components/dashboard/item-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { 
    TrendingUp, 
    Package, 
    DollarSign, 
    ShoppingCart, 
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    Calendar,
    Filter,
    Download,
    Plus
} from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [isUserLoading, user, router]);

    const itemsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'items');
    }, [firestore, user]);

    const { data: items, isLoading: areItemsLoading } = useCollection<Item>(itemsQuery);

    const sortedItems = useMemo(() => {
        if (!items) return [];
        return [...items].sort((a, b) => {
            const dateA = a.purchaseDate?.toDate() ?? 0;
            const dateB = b.purchaseDate?.toDate() ?? 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateB.getTime() - dateA.getTime();
        });
    }, [items]);

    const stats = useMemo(() => {
        if (!items) {
            return { totalProfit: 0, itemsInStock: 0, averageProfitMargin: 0, totalItemsSold: 0 };
        }
        const soldItems = items.filter(item => item.status === 'Sold' && typeof item.salePrice === 'number');
        const totalProfit = soldItems.reduce((acc, item) => acc + (item.profit ?? (item.salePrice! - item.purchasePrice)), 0);
        const itemsInStock = items.filter(item => item.status === 'In Stock').length;
        const totalPurchasePriceOfSoldItems = soldItems.reduce((acc, item) => acc + item.purchasePrice, 0);
        const averageProfitMargin = totalPurchasePriceOfSoldItems > 0
            ? totalProfit / totalPurchasePriceOfSoldItems
            : 0;

        return {
            totalProfit,
            itemsInStock,
            averageProfitMargin,
            totalItemsSold: soldItems.length,
        }
    }, [items]);

    if (isUserLoading || !user) {
        return (
            <div className="min-h-screen bg-slate-950 p-6 md:p-8">
                <div className="max-w-[1800px] mx-auto space-y-6">
                    <Skeleton className="h-24 bg-slate-900 rounded-3xl" />
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-48 bg-slate-900 rounded-3xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <Skeleton className="xl:col-span-2 h-[450px] bg-slate-900 rounded-3xl" />
                        <Skeleton className="h-[450px] bg-slate-900 rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    const currentDate = new Date().toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short' 
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="max-w-[1800px] mx-auto p-6 md:p-8 space-y-6">
                
                {/* 🎯 HEADER ULTRA MODERNO */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-2">
                            {currentDate}
                        </p>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                            Olá, {user.displayName || 'Revendedor'}! 👋
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Veja o que está acontecendo na sua loja este mês.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 
                                         text-white rounded-2xl transition-all duration-200 
                                         flex items-center gap-2 font-medium">
                            <Calendar className="w-4 h-4" />
                            Este mês
                            <ArrowDownRight className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 
                                         text-white rounded-2xl transition-all duration-200">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 💎 CARDS DE ESTATÍSTICAS MODERNOS */}
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                    
                    {/* Card 1: Lucro Total */}
                    <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl p-6 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                        
                        {/* Glow effect decorativo */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                        
                        <div className="relative">
                            {/* Header com ícone */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-blue-500/10 rounded-2xl">
                                    <DollarSign className="w-6 h-6 text-blue-400" strokeWidth={2.5} />
                                </div>
                                <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            
                            {/* Valor principal */}
                            <div className="mb-4">
                                <p className="text-slate-400 text-sm font-medium mb-2">
                                    Receita Total
                                </p>
                                <p className="text-4xl font-bold mb-1">
                                    {new Intl.NumberFormat('pt-BR', { 
                                        style: 'currency', 
                                        currency: 'BRL',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(stats.totalProfit)}
                                </p>
                            </div>
                            
                            {/* Badge de tendência */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 
                                          border border-emerald-500/20 rounded-xl w-fit">
                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 text-sm font-bold">+2.5%</span>
                                <span className="text-slate-500 text-xs">vs mês passado</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Total de Pedidos */}
                    <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl p-6 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                        
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
                        
                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-orange-500/10 rounded-2xl">
                                    <ShoppingCart className="w-6 h-6 text-orange-400" strokeWidth={2.5} />
                                </div>
                                <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-slate-400 text-sm font-medium mb-2">
                                    Total de Pedidos
                                </p>
                                <p className="text-4xl font-bold mb-1">
                                    {stats.totalItemsSold}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 
                                          border border-red-500/20 rounded-xl w-fit">
                                <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-bold">-0.8%</span>
                                <span className="text-slate-500 text-xs">vs mês passado</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Total de Visitantes */}
                    <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl p-6 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                        
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
                        
                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-pink-500/10 rounded-2xl">
                                    <Package className="w-6 h-6 text-pink-400" strokeWidth={2.5} />
                                </div>
                                <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-slate-400 text-sm font-medium mb-2">
                                    Em Estoque
                                </p>
                                <p className="text-4xl font-bold mb-1">
                                    {stats.itemsInStock}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 
                                          border border-red-500/20 rounded-xl w-fit">
                                <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400 text-sm font-bold">-1.2%</span>
                                <span className="text-slate-500 text-xs">vs mês passado</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Lucro Líquido */}
                    <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl p-6 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                        
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                        
                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <TrendingUp className="w-6 h-6 text-emerald-400" strokeWidth={2.5} />
                                </div>
                                <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-slate-400 text-sm font-medium mb-2">
                                    Margem Média
                                </p>
                                <p className="text-4xl font-bold mb-1">
                                    {(stats.averageProfitMargin * 100).toFixed(1)}%
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 
                                          border border-emerald-500/20 rounded-xl w-fit">
                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 text-sm font-bold">+5.6%</span>
                                <span className="text-slate-500 text-xs">vs mês passado</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📊 SEÇÃO DE GRÁFICOS */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Gráfico Principal - Revenue */}
                    <div className="xl:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl overflow-hidden">
                        
                        {/* Header do gráfico */}
                        <div className="p-6 border-b border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Receita</h3>
                                    <p className="text-slate-400 text-sm">Este mês vs passado</p>
                                </div>
                                <button className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Gráfico */}
                        <div className="p-6">
                            <ProfitChart items={items} isLoading={areItemsLoading} />
                        </div>
                    </div>
                    
                    {/* Vendas por Categoria */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl overflow-hidden">
                        
                        <div className="p-6 border-b border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Vendas por Categoria</h3>
                                    <p className="text-slate-400 text-sm">Este mês vs passado</p>
                                </div>
                                <button className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <ItemSummary items={items} isLoading={areItemsLoading} />
                        </div>
                    </div>
                </div>

                {/* 📋 SEÇÃO INFERIOR COM INFO CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    
                    {/* Card de Pedidos Pendentes */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl p-6 relative overflow-hidden group hover:bg-slate-900/70 
                                  transition-all duration-300">
                        
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl 
                                      group-hover:bg-blue-500/20 transition-all duration-300" />
                        
                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-slate-800 rounded-2xl">
                                    <span className="text-3xl">📦</span>
                                </div>
                                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div>
                                <p className="text-5xl font-bold mb-2">{stats.itemsInStock}</p>
                                <p className="text-slate-400 text-sm mb-3">produtos</p>
                                <p className="text-xs text-slate-500">
                                    <span className="text-red-400 font-semibold">12 pedidos</span> aguardando confirmação
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card de Clientes */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl p-6 relative overflow-hidden group hover:bg-slate-900/70 
                                  transition-all duration-300">
                        
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl 
                                      group-hover:bg-purple-500/20 transition-all duration-300" />
                        
                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-slate-800 rounded-2xl">
                                    <span className="text-3xl">👥</span>
                                </div>
                                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div>
                                <p className="text-5xl font-bold mb-2">{Math.floor(stats.totalItemsSold * 0.7)}</p>
                                <p className="text-slate-400 text-sm mb-3">clientes</p>
                                <p className="text-xs text-slate-500">
                                    <span className="text-orange-400 font-semibold">{Math.floor(stats.totalItemsSold * 0.7)} clientes</span> aguardando resposta
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder cards */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl p-6 relative overflow-hidden group hover:bg-slate-900/70 
                                  transition-all duration-300">
                        
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl 
                                      group-hover:bg-emerald-500/20 transition-all duration-300" />
                        
                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-slate-800 rounded-2xl">
                                    <span className="text-3xl">✅</span>
                                </div>
                                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div>
                                <p className="text-5xl font-bold mb-2">{stats.totalItemsSold}</p>
                                <p className="text-slate-400 text-sm mb-3">vendidos</p>
                                <p className="text-xs text-slate-500">
                                    <span className="text-emerald-400 font-semibold">Taxa de conversão: 
                                    {stats.totalItemsSold > 0 ? ((stats.totalItemsSold / (stats.totalItemsSold + stats.itemsInStock)) * 100).toFixed(1) : 0}%</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl p-6 relative overflow-hidden group hover:bg-slate-900/70 
                                  transition-all duration-300">
                        
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl 
                                      group-hover:bg-pink-500/20 transition-all duration-300" />
                        
                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-slate-800 rounded-2xl">
                                    <span className="text-3xl">💰</span>
                                </div>
                                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div>
                                <p className="text-5xl font-bold mb-2">
                                    {new Intl.NumberFormat('pt-BR', { 
                                        style: 'currency', 
                                        currency: 'BRL',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(stats.totalProfit)}
                                </p>
                                <p className="text-slate-400 text-sm mb-3">lucro líquido</p>
                                <p className="text-xs text-slate-500">
                                    Margem: <span className="text-pink-400 font-semibold">
                                        {(stats.averageProfitMargin * 100).toFixed(1)}%
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📋 LISTA DE ITENS */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
                    
                    {/* Header da tabela */}
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Lista de Itens</h2>
                                <p className="text-slate-400 text-sm">
                                    {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'itens'}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 
                                                 text-white rounded-xl transition-all duration-200 
                                                 flex items-center gap-2 font-medium text-sm">
                                    <Download className="w-4 h-4" />
                                    Exportar
                                </button>
                                <Link href="/inventory/new">
                                    <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 
                                                    text-white rounded-xl transition-all duration-200 
                                                    flex items-center gap-2 font-medium text-sm">
                                        <Plus className="w-4 h-4" />
                                        Adicionar Item
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tabela */}
                    <div className="overflow-hidden">
                        <InventoryTable 
                            items={sortedItems} 
                            isLoading={areItemsLoading} 
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
