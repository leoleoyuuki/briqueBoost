import type { User } from './types';

// This file is now primarily for types and static data,
// as dynamic data is fetched directly from Firebase in the components.

export const mockUser: User = {
  name: 'Revendedor Pro',
  email: 'user@briqueboost.com',
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
};
