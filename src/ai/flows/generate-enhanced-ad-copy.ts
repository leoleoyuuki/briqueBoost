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
  initialTitle: z.string().describe('The current title of the product listing.'),
  initialDescription: z.string().describe('The current description of the product listing.'),
  itemDetails: z.string().describe('Additional details about the item for sale, such as condition, brand, and specific features.'),
});
export type GenerateEnhancedAdCopyInput = z.infer<typeof GenerateEnhancedAdCopyInputSchema>;

const GenerateEnhancedAdCopyOutputSchema = z.object({
  enhancedTitle: z.string().describe('An improved title for the product listing.'),
  enhancedDescription: z.string().describe('An improved description for the product listing.'),
  reasoning: z.string().describe('Explanation of why the title and description were enhanced.'),
});
export type GenerateEnhancedAdCopyOutput = z.infer<typeof GenerateEnhancedAdCopyOutputSchema>;

export async function generateEnhancedAdCopy(input: GenerateEnhancedAdCopyInput): Promise<GenerateEnhancedAdCopyOutput> {
  return generateEnhancedAdCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEnhancedAdCopyPrompt',
  input: {schema: GenerateEnhancedAdCopyInputSchema},
  output: {schema: GenerateEnhancedAdCopyOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in writing compelling product listings that attract buyers and increase sales.

  Given the following information about a product, generate an enhanced title and description that are more likely to attract buyers. Also, provide a brief explanation of your reasoning for the changes you made. The title should be concise and attention-grabbing, and the description should be detailed and persuasive.

  Initial Title: {{{initialTitle}}}
  Initial Description: {{{initialDescription}}}
  Item Details: {{{itemDetails}}}

  Follow these instructions when creating the enhanced title and description:

  - Use keywords that buyers are likely to search for.
  - Highlight the key benefits and features of the product.
  - Use persuasive language to create a sense of urgency and excitement.
  - Ensure the enhanced title and description are accurate and truthful.
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
