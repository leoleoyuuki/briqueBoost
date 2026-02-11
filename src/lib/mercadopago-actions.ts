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
            console.error('Mercado Pago API error:', {
                status: response.status,
                statusText: response.statusText,
                body: responseData
            });
            const errorMessage = responseData.message || 'Não foi possível iniciar o processo de assinatura. Por favor, verifique as configurações.';
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
        throw new Error('Ocorreu um erro de comunicação ao tentar criar a assinatura. Tente novamente mais tarde.');
    }
}
