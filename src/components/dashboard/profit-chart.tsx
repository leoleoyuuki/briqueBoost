'use client';

import { useMemo } from 'react';
import type { MonthlySummary } from '@/lib/types';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfitChartProps {
    summaries: MonthlySummary[] | null;
    isLoading: boolean;
    view: 'profit' | 'revenue';
}

const CustomTooltip = ({ active, payload, label, view }: any) => {
    if (active && payload && payload.length) {
        const colorClass = view === 'profit' ? 'text-primary' : 'text-chart-2';
        return (
            <div className="rounded-lg border border-border bg-background/90 p-2 shadow-sm backdrop-blur-sm">
                 <p className="text-sm font-semibold capitalize text-foreground">{label}</p>
                 <p className={`text-sm font-medium ${colorClass}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
                 </p>
            </div>
        );
    }
    return null;
};

export function ProfitChart({ summaries, isLoading, view = 'profit' }: ProfitChartProps) {
    const chartData = useMemo(() => {
        const dataMap = new Map<string, number>();
        if (summaries) {
            for (const summary of summaries) {
                 const monthName = format(new Date(summary.year, summary.month - 1), 'MMM', { locale: ptBR });
                 const value = view === 'profit' ? summary.totalProfit : (summary.totalRevenue ?? 0);
                 dataMap.set(monthName, value);
            }
        }

        const last6Months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), i));
        
        return last6Months.map(date => {
            const monthName = format(date, 'MMM', { locale: ptBR });
            return {
                name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                value: dataMap.get(monthName) ?? 0,
            };
        }).reverse();

    }, [summaries, view]);
    
    const chartConfig = {
        profit: {
            color: "hsl(var(--primary))",
            gradientId: "colorProfit"
        },
        revenue: {
            color: "hsl(var(--chart-2))",
            gradientId: "colorRevenue"
        }
    }
    
    const currentConfig = chartConfig[view];

    if (isLoading) {
        return <Skeleton className="h-[350px] w-full" />;
    }

    return (
        <div className="h-[350px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id={chartConfig.profit.gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartConfig.profit.color} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={chartConfig.profit.color} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id={chartConfig.revenue.gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartConfig.revenue.color} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={chartConfig.revenue.color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
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
                        tickFormatter={(value) => 
                            new Intl.NumberFormat('pt-BR', { 
                                notation: 'compact', 
                                compactDisplay: 'short' 
                            }).format(value as number)
                        }
                    />
                    <Tooltip content={<CustomTooltip view={view} />} cursor={{ stroke: currentConfig.color, strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Area 
                        type="monotone" 
                        dataKey="value"
                        stroke={currentConfig.color}
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill={`url(#${currentConfig.gradientId})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
