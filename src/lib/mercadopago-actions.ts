'use server';

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

    const planId = process.env.MERCADOPAGO_PLAN_ID;
    if (!planId) {
        console.error('Mercado Pago plan ID is not configured.');
        throw new Error('O plano de assinatura não está configurado. Por favor, contate o suporte.');
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    
    const createPayload = {
        preapproval_plan_id: planId,
        payer_email: userEmail,
        back_url: `${baseUrl}/subscription`, // User is redirected here after payment
    };

    try {
        const response = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(createPayload),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Mercado Pago API error:', responseData);
            throw new Error(responseData.message || 'Não foi possível iniciar o processo de assinatura. Tente novamente.');
        }

        if (responseData.init_point) {
            return { init_point: responseData.init_point };
        } else {
            console.error('Mercado Pago response is missing init_point:', responseData);
            throw new Error('Não foi possível iniciar o processo de assinatura. Tente novamente.');
        }

    } catch (error: any) {
        console.error('Mercado Pago fetch error:', error);
        throw new Error('Ocorreu um erro ao comunicar com o Mercado Pago. Tente novamente mais tarde.');
    }
}
