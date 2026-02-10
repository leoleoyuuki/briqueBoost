// This file is used to generate enhanced ad copy for items that will be sold by users.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @fileOverview AI-powered ad enhancement flow.
 *
 * - generateEnhancedAdCopy - A function that enhances product listings.
 * - GenerateEnhancedAdCopyInput - The input type for the generateEnhancedAdCopy function.
 * - GenerateEnhancedAdCopyOutput - The return type for the generateEnhancedAdCopy function.
 */

const GenerateEnhancedAdCopyInputSchema = z.object({
  initialTitle: z.string().describe('O título atual do anúncio do produto.'),
  initialDescription: z.string().describe('A descrição atual do anúncio do produto.'),
  itemDetails: z.string().describe('Detalhes adicionais sobre o item à venda, como condição, marca e características específicas.'),
});
export type GenerateEnhancedAdCopyInput = z.infer<typeof GenerateEnhancedAdCopyInputSchema>;

const GenerateEnhancedAdCopyOutputSchema = z.object({
  enhancedTitle: z.string().describe('Um título aprimorado para o anúncio do produto.'),
  enhancedDescription: z.string().describe('Uma descrição aprimorada para o anúncio do produto.'),
  reasoning: z.string().describe('Explicação do motivo pelo qual o título e a descrição foram aprimorados.'),
});
export type GenerateEnhancedAdCopyOutput = z.infer<typeof GenerateEnhancedAdCopyOutputSchema>;

export async function generateEnhancedAdCopy(input: GenerateEnhancedAdCopyInput): Promise<GenerateEnhancedAdCopyOutput> {
  return generateEnhancedAdCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEnhancedAdCopyPrompt',
  input: {schema: GenerateEnhancedAdCopyInputSchema},
  output: {schema: GenerateEnhancedAdCopyOutputSchema},
  prompt: `Você é um redator de marketing especialista em escrever anúncios de produtos atraentes que aumentam as vendas.

  Com base nas informações a seguir sobre um produto, gere um título e uma descrição aprimorados em português que sejam mais propensos a atrair compradores. Além disso, forneça uma breve explicação do seu raciocínio para as alterações feitas. O título deve ser conciso e chamativo, e a descrição deve ser detalhada e persuasiva.

  Título Inicial: {{{initialTitle}}}
  Descrição Inicial: {{{initialDescription}}}
  Detalhes do Item: {{{itemDetails}}}

  Siga estas instruções ao criar o título e a descrição aprimorados:

  - Use palavras-chave que os compradores provavelmente pesquisarão.
  - Destaque os principais benefícios e características do produto.
  - Use uma linguagem persuasiva para criar um senso de urgência e entusiasmo.
  - Garanta que o título e a descrição aprimorados sejam precisos e verdadeiros.
`,
});

const generateEnhancedAdCopyFlow = ai.defineFlow(
  {
    name: 'generateEnhancedAdCopyFlow',
    inputSchema: GenerateEnhancedAdCopyInputSchema,
    outputSchema: GenerateEnhancedAdCopyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
