export type Item = {
  id: string;
  name: string;
  purchasePrice: number;
  salePrice: number | null;
  condition: 'New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair' | 'For Parts';
  source: string;
  status: 'In Stock' | 'Sold';
  initialTitle: string;
  initialDescription: string;
  enhancedTitle: string | null;
  enhancedDescription: string | null;
  reasoning: string | null;
  dateAdded: string; // ISO string
  dateSold: string | null; // ISO string
  platform: string;
  imageUrl: string;
  imageHint: string;
};

export type User = {
  name: string;
  email: string;
  avatarUrl: string;
};
