'use client';

import { useState, useEffect } from 'react';
import Joyride, { type Step, CallBackProps, STATUS } from 'react-joyride';

const TOUR_STEPS: Step[] = [
    {
        target: 'body',
        content: 'Bem-vindo ao BriqueBoost! Vamos fazer um tour rápido pelas principais funcionalidades.',
        placement: 'center',
        disableBeacon: true,
    },
    {
        target: '#tour-stats-cards',
        content: 'Aqui você tem uma visão geral e em tempo real do seu faturamento bruto e lucro líquido. Acompanhe o desempenho do seu negócio rapidamente.',
        placement: 'bottom',
    },
    {
        target: '#tour-performance-chart',
        content: 'Este gráfico mostra a evolução do seu lucro ou faturamento ao longo dos meses. Use as abas para alternar a visualização.',
        placement: 'top',
    },
    {
        target: '#tour-recent-items-table',
        content: 'Seus itens adicionados mais recentemente aparecerão aqui. Você pode ver detalhes ou adicionar um novo item clicando nos botões.',
        placement: 'top',
    },
    {
        target: '#tour-add-item-button',
        content: 'Clique aqui para adicionar um novo item ao seu inventário. É o primeiro passo para começar a vender!',
        placement: 'top',
    },
    {
        target: '#tour-sidebar-menu',
        content: 'Use o menu lateral para navegar entre as seções: Inventário completo, Lista de Desejos dos clientes e Suporte.',
        placement: 'right',
    },
];

export const DashboardTour = () => {
    const [runTour, setRunTour] = useState(false);

    useEffect(() => {
        const hasCompletedTour = localStorage.getItem('briqueboost_tour_completed');
        if (hasCompletedTour !== 'true') {
            // Use a timeout to ensure the DOM is fully rendered
            setTimeout(() => {
                setRunTour(true);
            }, 1000);
        }
    }, []);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            localStorage.setItem('briqueboost_tour_completed', 'true');
            setRunTour(false);
        }
    };

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <Joyride
            steps={TOUR_STEPS}
            run={runTour}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            locale={{
                back: 'Voltar',
                close: 'Fechar',
                last: 'Fim',
                next: 'Próximo',
                skip: 'Pular',
            }}
            styles={{
                options: {
                    zIndex: 10000,
                    arrowColor: '#1e293b', // slate-800
                    backgroundColor: '#1e293b', // slate-800
                    primaryColor: '#3b82f6', // blue-500
                    textColor: '#cbd5e1', // slate-300
                },
                tooltip: {
                    borderRadius: 'var(--radius)',
                    border: '1px solid #334155' // slate-700
                },
                buttonNext: {
                    borderRadius: '0.5rem',
                },
                buttonBack: {
                    borderRadius: '0.5rem',
                },
                buttonSkip: {
                    borderRadius: '0.5rem',
                    color: '#94a3b8' // slate-400
                }
            }}
        />
    );
};
