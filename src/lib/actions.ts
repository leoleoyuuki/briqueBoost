'use server';

import { generateEnhancedAdCopy } from '@/ai/flows/generate-enhanced-ad-copy';
import type { GenerateEnhancedAdCopyInput } from '@/ai/flows/generate-enhanced-ad-copy';

export async function enhanceAdCopyAction(input: GenerateEnhancedAdCopyInput) {
  // Here you would typically add validation, error handling, and authentication checks
  try {
    const result = await generateEnhancedAdCopy(input);
    return result;
  } catch (error) {
    console.error('AI enhancement failed:', error);
    // In a real app, you might want to return a more user-friendly error
    throw new Error('Falha ao aprimorar o anúncio. Tente novamente.');
  }
}
