'use client';

import { useState, useEffect } from 'react';
import Joyride, { type Step, CallBackProps, STATUS } from 'react-joyride';

const TOUR_STEPS: Step[] = [
    {
        target: '#support-tour-card',
        content: 'Bem-vindo à página de Suporte! Aqui você encontra as melhores formas de entrar em contato conosco.',
        placement: 'bottom',
        disableBeacon: true,
    },
    {
        target: '#support-tour-whatsapp',
        content: 'Se tiver uma dúvida rápida, pode nos chamar no WhatsApp por aqui.',
        placement: 'top',
    },
    {
        target: '#support-tour-calendly',
        content: 'Se preferir uma apresentação completa e guiada da plataforma, agende um horário de onboarding conosco. É gratuito!',
        placement: 'top',
    }
];

export const SupportTour = () => {
    const [runTour, setRunTour] = useState(false);

    useEffect(() => {
        const hasCompletedTour = localStorage.getItem('briqueboost_support_tour_completed');
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
            localStorage.setItem('briqueboost_support_tour_completed', 'true');
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
