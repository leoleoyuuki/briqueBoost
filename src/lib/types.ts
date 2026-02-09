export type WithId<T> = T & { id: string };

export type Item = {
  id: string;
  userId: string;
  name: string;
  purchasePrice: number;
  purchaseDate: any; // Can be Timestamp from Firebase
  salePrice: number | null;
  condition: 'New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair' | 'For Parts';
  source: string;
  status: 'In Stock' | 'Sold';
  initialTitle: string;
  initialDescription: string;
  enhancedTitle: string | null;
  enhancedDescription: string | null;
  reasoning: string | null;
  dateSold: any | null; // Can be Timestamp from Firebase
  platform: string;
  imageUrl: string;
  imageHint: string;
};

export type User = {
  name: string;
  email: string;
  avatarUrl?: string;
};
