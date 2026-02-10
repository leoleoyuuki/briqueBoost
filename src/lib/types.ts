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
  profit?: number;
};

// Represents the user profile document stored in Firestore
export type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: any; // Can be Timestamp from Firebase
  aiUsageCount: number;
  aiUsageLastReset: any; // Can be Timestamp
  totalProfit?: number;
  totalItemsSold?: number;
  itemsInStock?: number;
  totalInvestmentSold?: number;
  itemsInStockNew?: number;
  itemsInStockUsedLikeNew?: number;
  itemsInStockUsedGood?: number;
  itemsInStockUsedFair?: number;
  itemsInStockForParts?: number;
};

export type MonthlySummary = {
  id: string; // YYYY-MM
  year: number;
  month: number;
  totalProfit: number;
  totalItemsSold: number;
}

// Represents the mock user data structure, not used with live data.
export type User = {
  name: string;
  email: string;
  avatarUrl?: string;
};
