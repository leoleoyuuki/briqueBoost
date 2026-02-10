'use client';

import { useMemo } from 'react';
import type { MonthlySummary } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, subMonths, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border bg-background/90 p-2 shadow-sm">
                 <p className="text-sm font-semibold capitalize text-foreground">{label}</p>
                 <p className="text-sm text-primary">{formatCurrency(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

export function ProfitChart({ summaries, isLoading }: { summaries: MonthlySummary[] | null; isLoading: boolean }) {
    const chartData = useMemo(() => {
        const dataMap = new Map<string, number>();
        if (summaries) {
            for (const summary of summaries) {
                 const monthName = format(new Date(summary.year, summary.month - 1), 'MMM', { locale: ptBR });
                 dataMap.set(monthName, summary.totalProfit);
            }
        }

        const last6Months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), i));
        
        return last6Months.map(date => {
            const monthName = format(date, 'MMM', { locale: ptBR });
            return {
                name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                profit: dataMap.get(monthName) ?? 0,
            };
        }).reverse();

    }, [summaries]);

    if (isLoading) {
        return (
             <Card className="bg-card">
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col bg-card">
            <CardHeader>
                <CardTitle className="font-semibold text-lg text-foreground">Análise</CardTitle>
                <CardDescription>Lucro dos itens vendidos nos últimos 6 meses.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pl-2">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$${(value as number) / 1000}k`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Area 
                                type="monotone" 
                                dataKey="profit" 
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorProfit)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
