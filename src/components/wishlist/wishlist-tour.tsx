'use client';

import { useState, useEffect } from 'react';
import Joyride, { type Step, CallBackProps, STATUS } from 'react-joyride';

const TOUR_STEPS: Step[] = [
    {
        target: '#wishlist-tour-header',
        content: 'Esta é a sua Lista de Desejos. Anote aqui os itens que seus clientes procuram para não perder nenhuma oportunidade de venda!',
        placement: 'bottom',
        disableBeacon: true,
    },
    {
        target: '#wishlist-tour-add',
        content: 'Clique aqui para adicionar um novo item à sua lista.',
        placement: 'bottom',
    },
    {
        target: '#wishlist-tour-table',
        content: 'Gerencie seus itens aqui. Você pode marcar um item como "Encontrado" quando o adquirir, ou "Arquivar" para limpar sua lista.',
        placement: 'top',
    }
];

export const WishlistTour = () => {
    const [runTour, setRunTour] = useState(false);

    useEffect(() => {
        const hasCompletedTour = localStorage.getItem('briqueboost_wishlist_tour_completed');
        if (hasCompletedTour !== 'true') {
            setTimeout(() => {
                setRunTour(true);
            }, 1000);
        }
    }, []);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            localStorage.setItem('briqueboost_wishlist_tour_completed', 'true');
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
