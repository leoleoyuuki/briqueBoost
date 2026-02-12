import {
  LayoutDashboard,
  Package,
  Heart,
  CreditCard,
  Shield,
} from 'lucide-react';

export const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventário', icon: Package },
  { href: '/wishlist', label: 'Lista de Desejos', icon: Heart },
  { href: '/subscription', label: 'Assinatura', icon: CreditCard },
];

export const adminMenuItems = [
    { href: '/admin/generate-codes', label: 'Gerar Códigos', icon: Shield }
];
