import {
  LayoutDashboard,
  Package,
  Heart,
  Shield,
  LifeBuoy,
} from 'lucide-react';

export const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventário', icon: Package },
  { href: '/wishlist', label: 'Lista de Desejos', icon: Heart },
  { href: '/support', label: 'Suporte', icon: LifeBuoy },
];

export const adminMenuItems = [
    { href: '/admin/generate-codes', label: 'Gerar Códigos', icon: Shield }
];
