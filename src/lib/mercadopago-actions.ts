'use server';

import { randomUUID } from 'crypto';

interface CreateSubscriptionInput {
    userEmail: string;
}

export async function createSubscriptionAction(input: CreateSubscriptionInput) {
    const { userEmail } = input;
    
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('Mercado Pago access token is not configured.');
        throw new Error('O pagamento não está configurado. Por favor, contate o suporte.');
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    
    const createPayload = {
        reason: 'Assinatura BriqueBoost Pro',
        auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: 29.90,
            currency_id: 'BRL'
        },
        back_url: `${baseUrl}/subscription`,
        payer_email: userEmail,
    };

    const idempotencyKey = randomUUID();

    try {
        const response = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify(createPayload),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Mercado Pago API error:', {
                status: response.status,
                statusText: response.statusText,
                idempotencyKey: idempotencyKey,
                body: responseData
            });
            const errorMessage = responseData.message || 'Não foi possível iniciar o processo de assinatura. Verifique as credenciais e tente novamente.';
            throw new Error(errorMessage);
        }

        if (responseData.init_point) {
            return { init_point: responseData.init_point };
        } else {
            console.error('Mercado Pago response is missing init_point:', responseData);
            throw new Error('Não foi possível obter o link de pagamento. Tente novamente.');
        }

    } catch (error: any) {
        console.error('Falha na comunicação com a API do Mercado Pago. Verifique a conexão e as credenciais.', error);
        throw new Error(error.message || 'Ocorreu um erro de comunicação ao tentar criar a assinatura. Tente novamente mais tarde.');
    }
}
