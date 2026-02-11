import {
  LayoutDashboard,
  Package,
  Heart,
  CreditCard,
} from 'lucide-react';

export const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventário', icon: Package },
  { href: '/wishlist', label: 'Lista de Desejos', icon: Heart },
  { href: '/subscription', label: 'Assinatura', icon: CreditCard },
];
