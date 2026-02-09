import type { Item, User } from './types';

export const mockItems: Item[] = [
  {
    id: '1',
    name: 'Jaqueta de Couro Vintage',
    purchasePrice: 150,
    salePrice: 450,
    condition: 'Used - Good',
    source: 'Brechó Local',
    status: 'Sold',
    initialTitle: 'jaqueta de couro',
    initialDescription: 'jaqueta de couro preta, bom estado',
    enhancedTitle: 'Jaqueta de Couro Vintage Anos 80 - Estilo Motoqueiro Clássico',
    enhancedDescription: 'Rara jaqueta de couro preta dos anos 80 em excelente estado. Perfeita para um look retrô e autêntico. Possui zíperes originais e forro intacto. Uma peça de colecionador!',
    reasoning: 'O título e a descrição foram aprimorados com palavras-chave como "Vintage", "Anos 80" e "Estilo Motoqueiro" para atrair um público específico. Detalhes como "zíperes originais" agregam valor.',
    dateAdded: '2023-10-15T10:00:00Z',
    dateSold: '2023-10-25T14:30:00Z',
    platform: 'Mercado Livre',
    imageUrl: 'https://picsum.photos/seed/jacket1/400/600',
    imageHint: 'leather jacket',
  },
  {
    id: '2',
    name: 'Console Super Nintendo',
    purchasePrice: 200,
    salePrice: null,
    condition: 'Used - Fair',
    source: 'Amigo',
    status: 'In Stock',
    initialTitle: 'video game antigo',
    initialDescription: 'snes funcionando com 2 controles e 1 jogo',
    enhancedTitle: null,
    enhancedDescription: null,
    reasoning: null,
    dateAdded: '2023-11-05T11:20:00Z',
    dateSold: null,
    platform: 'OLX',
    imageUrl: 'https://picsum.photos/seed/console1/600/400',
    imageHint: 'gaming console'
  },
  {
    id: '3',
    name: 'Cadeira de Escritório Ergonômica',
    purchasePrice: 300,
    salePrice: 650,
    condition: 'Used - Like New',
    source: 'Marketplace FB',
    status: 'Sold',
    initialTitle: 'Cadeira de escritório',
    initialDescription: 'Cadeira giratória preta, com ajuste de altura.',
    enhancedTitle: 'Cadeira de Escritório Ergonômica Premium - Suporte Lombar e Braços Ajustáveis',
    enhancedDescription: 'Como nova! Cadeira de escritório ergonômica com múltiplos ajustes para máximo conforto. Ideal para home office. Suporte lombar ajustável, braços 3D e rodízios silenciosos.',
    reasoning: 'Adicionamos termos como "Ergonômica Premium" e "Suporte Lombar" para justificar um preço mais alto e atrair compradores que buscam qualidade e conforto.',
    dateAdded: '2023-11-10T09:00:00Z',
    dateSold: '2023-11-18T18:00:00Z',
    platform: 'Venda Direta',
    imageUrl: 'https://picsum.photos/seed/chair1/400/600',
    imageHint: 'office chair'
  },
  {
    id: '4',
    name: 'Bicicleta Caloi 10',
    purchasePrice: 120,
    salePrice: null,
    condition: 'Used - Good',
    source: 'Feira do Rolo',
    status: 'In Stock',
    initialTitle: 'bike caloi 10',
    initialDescription: 'bicicleta de corrida antiga, precisa de um pneu novo.',
    enhancedTitle: null,
    enhancedDescription: null,
    reasoning: null,
    dateAdded: '2023-11-20T16:45:00Z',
    dateSold: null,
    platform: 'Marketplace FB',
    imageUrl: 'https://picsum.photos/seed/bike1/600/400',
    imageHint: 'racing bicycle'
  },
];

export const mockUser: User = {
  name: 'Revendedor Pro',
  email: 'user@briqueboost.com',
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
};

// Simulate database operations
export function getItems() {
  return mockItems;
}

export function getItemById(id: string) {
  return mockItems.find((item) => item.id === id);
}

export function calculateStats() {
    const soldItems = mockItems.filter(item => item.status === 'Sold' && item.salePrice !== null);
    const totalProfit = soldItems.reduce((acc, item) => acc + (item.salePrice! - item.purchasePrice), 0);
    const itemsInStock = mockItems.filter(item => item.status === 'In Stock').length;
    const averageProfitMargin = soldItems.length > 0
        ? totalProfit / soldItems.reduce((acc, item) => acc + item.purchasePrice, 0)
        : 0;

    return {
        totalProfit,
        itemsInStock,
        averageProfitMargin,
        totalItemsSold: soldItems.length,
    }
}
