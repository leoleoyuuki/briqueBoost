'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit, where } from 'firebase/firestore';
import type { Item, UserProfile, MonthlySummary } from '@/lib/types';
import { InventoryTable } from '@/components/dashboard/inventory-table';
import { ProfitChart } from '@/components/dashboard/profit-chart';
import { ItemSummary } from '@/components/dashboard/item-summary';
import { Skeleton } from '@/components/ui/skeleton';
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
    Plus,
    CircleDollarSign,
    PiggyBank
} from 'lucide-react';
import { subMonths, format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoCarouselCard } from '@/components/dashboard/info-carousel-card';
import { DashboardTour } from '@/components/dashboard/dashboard-tour';

function ChangeIndicator({ change, isPositive }: { change: number, isPositive: boolean }) {
    if (change === 0) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit">
                <span className="text-slate-400 text-sm font-bold">~ 0%</span>
                <span className="text-slate-500 text-xs">vs mês passado</span>
            </div>
        );
    }

    const sign = isPositive ? '+' : '';

    if (isPositive) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-bold">{sign}{change}%</span>
                <span className="text-slate-500 text-xs">vs mês passado</span>
            </div>
        );
    } else {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl w-fit">
                <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 text-sm font-bold">{sign}{change}%</span>
                <span className="text-slate-500 text-xs">vs mês passado</span>
            </div>
        );
    }
}


export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [chartView, setChartView] = useState<'profit' | 'revenue'>('profit');

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    // Query for last 6 months of summaries for the profit chart
    const summariesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'users', user.uid, 'monthlySummaries'), 
            orderBy('id', 'desc'), 
            limit(6)
        );
    }, [firestore, user]);
    const { data: monthlySummaries, isLoading: areSummariesLoading } = useCollection<MonthlySummary>(summariesQuery);

    const monthlyChanges = useMemo(() => {
        const defaultChanges = {
            revenue: { change: 0, isPositive: true },
            profit: { change: 0, isPositive: true },
            investment: { change: 0, isPositive: true },
            itemsSold: { change: 0, isPositive: true },
            avgMargin: { change: 0, isPositive: true },
        };

        if (!monthlySummaries || monthlySummaries.length < 1) {
            return defaultChanges;
        }

        const now = new Date();
        const currentMonthId = format(now, 'yyyy-MM');
        const prevMonthId = format(subMonths(now, 1), 'yyyy-MM');

        const currentMonthData = monthlySummaries.find(s => s.id === currentMonthId);
        const prevMonthData = monthlySummaries.find(s => s.id === prevMonthId);

        const calculateChange = (current?: number, previous?: number) => {
            const c = current ?? 0;
            const p = previous ?? 0;
            if (p === 0) {
                // If previous is 0, any increase is "infinite" but we can show 100%
                // If current is also 0, change is 0.
                return { change: c > 0 ? 100 : 0, isPositive: c >= 0 };
            }
            const change = ((c - p) / p) * 100;
            return { change: parseFloat(change.toFixed(1)), isPositive: change >= 0 };
        };
        
        const currentAvgMargin = (currentMonthData?.totalInvestmentSold ?? 0) > 0 
            ? (currentMonthData?.totalProfit ?? 0) / currentMonthData!.totalInvestmentSold! 
            : 0;
        const prevAvgMargin = (prevMonthData?.totalInvestmentSold ?? 0) > 0 
            ? (prevMonthData?.totalProfit ?? 0) / prevMonthData!.totalInvestmentSold! 
            : 0;


        return {
            revenue: calculateChange(currentMonthData?.totalRevenue, prevMonthData?.totalRevenue),
            profit: calculateChange(currentMonthData?.totalProfit, prevMonthData?.totalProfit),
            investment: calculateChange(currentMonthData?.totalInvestment, prevMonthData?.totalInvestment),
            itemsSold: calculateChange(currentMonthData?.totalItemsSold, prevMonthData?.totalItemsSold),
            avgMargin: calculateChange(currentAvgMargin, prevAvgMargin),
        };

    }, [monthlySummaries]);


    // Query for recent items for the table
    const recentItemsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'users', user.uid, 'items'), orderBy('purchaseDate', 'desc'), limit(5));
    }, [firestore, user]);
    const { data: recentItems, isLoading: areRecentItemsLoading } = useCollection<Item>(recentItemsQuery);

    const sortedRecentItems = useMemo(() => {
        if (!recentItems) return [];
        return [...recentItems].sort((a, b) => {
            const dateA = a.purchaseDate?.toDate() ?? 0;
            const dateB = b.purchaseDate?.toDate() ?? 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateB.getTime() - dateA.getTime();
        });
    }, [recentItems]);
    
    const stats = useMemo(() => {
        if (!userProfile) {
            return { totalProfit: 0, itemsInStock: 0, averageProfitMargin: 0, totalItemsSold: 0, totalRevenue: 0, totalInvestment: 0 };
        }
        const totalProfit = userProfile.totalProfit ?? 0;
        const totalItemsSold = userProfile.totalItemsSold ?? 0;
        const itemsInStock = userProfile.itemsInStock ?? 0;
        const totalInvestmentSold = userProfile.totalInvestmentSold ?? 0;
        const totalRevenue = userProfile.totalRevenue ?? 0;
        const totalInvestment = userProfile.totalInvestment ?? 0;
        
        const averageProfitMargin = totalInvestmentSold > 0
            ? totalProfit / totalInvestmentSold
            : 0;

        return {
            totalProfit,
            itemsInStock,
            averageProfitMargin,
            totalItemsSold,
            totalRevenue,
            totalInvestment,
        }
    }, [userProfile]);

    const currentDate = new Date().toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short' 
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-6">
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-2">
                            {currentDate}
                        </p>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                            Olá, {user?.displayName || 'Revendedor'}! 👋
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

                <div id="tour-stats-cards" className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                    <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl p-4 md:p-6 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <div className="p-3 bg-blue-500/10 rounded-2xl">
                                    <CircleDollarSign className="w-6 h-6 text-blue-400" strokeWidth={2.5} />
                                </div>
                                <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="mb-4">
                                <p className="text-slate-400 text-sm font-medium mb-2">Faturamento Bruto</p>
                                <p className="text-3xl sm:text-4xl font-bold mb-1">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)}
                                </p>
                            </div>
                            <ChangeIndicator change={monthlyChanges.revenue.change} isPositive={monthlyChanges.revenue.isPositive} />
                        </div>
                    </div>

                    <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 
                                  rounded-3xl p-4 md:p-6 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <DollarSign className="w-6 h-6 text-emerald-400" strokeWidth={2.5} />
                                </div>
                                <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="mb-4">
                                <p className="text-slate-400 text-sm font-medium mb-2">Lucro Líquido</p>
                                <p className="text-3xl sm:text-4xl font-bold mb-1">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(stats.totalProfit)}
                                </p>
                            </div>
                            <ChangeIndicator change={monthlyChanges.profit.change} isPositive={monthlyChanges.profit.isPositive} />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-6">
                    <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-purple-500/10 rounded-2xl">
                                    <PiggyBank className="w-5 h-5 text-purple-400" strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="mb-1">
                                <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1">Investimento Total</p>
                                <p className="text-2xl sm:text-3xl font-bold">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalInvestment)}
                                </p>
                            </div>
                            <ChangeIndicator change={monthlyChanges.investment.change} isPositive={monthlyChanges.investment.isPositive} />
                        </div>
                    </div>

                    <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/20 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-orange-500/10 rounded-2xl">
                                    <ShoppingCart className="w-5 h-5 text-orange-400" strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="mb-1">
                                <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1">Total de Itens Vendidos</p>
                                <p className="text-2xl sm:text-3xl font-bold">{stats.totalItemsSold}</p>
                            </div>
                            <ChangeIndicator change={monthlyChanges.itemsSold.change} isPositive={monthlyChanges.itemsSold.isPositive} />
                        </div>
                    </div>

                    <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/20 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-pink-500/10 rounded-2xl">
                                    <Package className="w-5 h-5 text-pink-400" strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="mb-1">
                                <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1">Em Estoque</p>
                                <p className="text-2xl sm:text-3xl font-bold">{stats.itemsInStock}</p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/20 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-teal-500/10 rounded-2xl">
                                    <TrendingUp className="w-5 h-5 text-teal-400" strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="mb-1">
                                <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1">Margem Média</p>
                                <p className="text-2xl sm:text-3xl font-bold">
                                    {(stats.averageProfitMargin * 100).toFixed(1)}%
                                </p>
                            </div>
                            <ChangeIndicator change={monthlyChanges.avgMargin.change} isPositive={monthlyChanges.avgMargin.isPositive} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div id="tour-performance-chart" className="xl:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Análise de Performance</h3>
                                <p className="text-slate-400 text-sm">Visualize o lucro ou faturamento dos últimos 6 meses.</p>
                            </div>
                            <Tabs defaultValue="profit" onValueChange={(value) => setChartView(value as 'profit' | 'revenue')} className="w-full sm:w-fit">
                                <TabsList className="bg-slate-800 grid w-full grid-cols-2">
                                    <TabsTrigger value="profit">Lucro</TabsTrigger>
                                    <TabsTrigger value="revenue">Faturamento</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <div className="p-2 sm:p-6">
                            <ProfitChart summaries={monthlySummaries} isLoading={areSummariesLoading} view={chartView} />
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <InfoCarouselCard />

                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">Itens por Condição</h3>
                                        <p className="text-slate-400 text-sm">Resumo do seu estoque atual.</p>
                                    </div>
                                    <button className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                                        <MoreVertical className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 md:p-6">
                               <ItemSummary userProfile={userProfile} isLoading={isProfileLoading} />
                            </div>
                        </div>
                    </div>
                </div>

                <div id="tour-recent-items-table" className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden">
                    
                    <div className="p-4 md:p-6 border-b border-slate-800">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Itens Recentes</h2>
                                <p className="text-slate-400 text-sm">
                                    {sortedRecentItems.length} {sortedRecentItems.length === 1 ? 'item' : 'itens'}
                                </p>
                            </div>
                            
                            <div className="flex items-center flex-wrap justify-end gap-3">
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
                    
                    <div className="overflow-hidden">
                        <InventoryTable 
                            items={sortedRecentItems} 
                            isLoading={areRecentItemsLoading} 
                        />
                    </div>
                </div>

            </div>
            <DashboardTour />
        </div>
    );
}
