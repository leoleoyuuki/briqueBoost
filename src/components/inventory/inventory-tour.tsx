'use client';

import { useState, useEffect } from 'react';
import Joyride, { type Step, CallBackProps, STATUS } from 'react-joyride';

const TOUR_STEPS: Step[] = [
    {
        target: '#inventory-tour-header',
        content: 'Bem-vindo ao seu Inventário! Aqui você pode ver todos os itens que adicionou.',
        placement: 'bottom',
        disableBeacon: true,
    },
    {
        target: '#inventory-tour-add',
        content: 'Use este botão para adicionar novos itens ao seu estoque.',
        placement: 'bottom',
    },
    {
        target: '#inventory-tour-table',
        content: 'A tabela mostra todos os seus itens. Você pode clicar em "Ver" para abrir a página de detalhes de cada um.',
        placement: 'top',
    },
    {
        target: '#inventory-tour-pagination',
        content: 'Quando sua lista crescer, use os botões de paginação para navegar entre as páginas.',
        placement: 'top',
    }
];

export const InventoryTour = () => {
    const [runTour, setRunTour] = useState(false);
    const [steps, setSteps] = useState<Step[]>([]);

    useEffect(() => {
        const hasCompletedTour = localStorage.getItem('briqueboost_inventory_tour_completed');
        if (hasCompletedTour !== 'true') {
            setTimeout(() => {
                // Check if pagination exists before setting steps
                const paginationTarget = document.querySelector('#inventory-tour-pagination');
                const activeSteps = paginationTarget ? TOUR_STEPS : TOUR_STEPS.slice(0, -1);
                setSteps(activeSteps);
                setRunTour(true);
            }, 1000);
        }
    }, []);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            localStorage.setItem('briqueboost_inventory_tour_completed', 'true');
            setRunTour(false);
        }
    };

    if (typeof window === 'undefined' || steps.length === 0) {
        return null;
    }

    return (
        <Joyride
            steps={steps}
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
                    arrowColor: '#1e293b',
                    backgroundColor: '#1e293b',
                    primaryColor: '#3b82f6',
                    textColor: '#cbd5e1',
                },
                tooltip: {
                    borderRadius: 'var(--radius)',
                    border: '1px solid #334155'
                },
                buttonNext: { borderRadius: '0.5rem' },
                buttonBack: { borderRadius: '0.5rem' },
                buttonSkip: { borderRadius: '0.5rem', color: '#94a3b8' }
            }}
        />
    );
};
