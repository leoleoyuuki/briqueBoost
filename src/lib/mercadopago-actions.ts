'use server';

import * as mercadopago from 'mercadopago';

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
    
    // The base URL should be in your environment variables.
    // Using localhost for now as a fallback.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    
    const client = new mercadopago.MercadoPagoConfig({ 
        accessToken,
        options: { timeout: 5000 }
    });
    
    const subscription = new mercadopago.Subscription(client);

    const createPayload = {
        reason: 'Assinatura BriqueBoost Pro',
        auto_recurring: {
            frequency: 1,
            frequency_type: 'months' as 'months',
            transaction_amount: 29.90,
            currency_id: 'BRL' as 'BRL',
        },
        back_url: `${baseUrl}/subscription`, // User is redirected here after payment
        payer_email: userEmail,
    };

    try {
        const response = await subscription.create({ body: createPayload });

        if (response.id && response.init_point) {
            // The init_point is the URL where the user should be redirected to complete the payment.
            return { init_point: response.init_point };
        } else {
            console.error('Mercado Pago response is missing init_point:', response);
            throw new Error('Não foi possível iniciar o processo de assinatura. Tente novamente.');
        }

    } catch (error: any) {
        console.error('Mercado Pago API error:', error.cause || error.message);
        throw new Error('Ocorreu um erro ao comunicar com o Mercado Pago. Tente novamente mais tarde.');
    }
}
