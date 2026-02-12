import {
  LayoutDashboard,
  Package,
  Heart,
  CreditCard,
  Shield,
  LifeBuoy,
} from 'lucide-react';

export const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventário', icon: Package },
  { href: '/wishlist', label: 'Lista de Desejos', icon: Heart },
<<<<<<< HEAD
  { href: '/subscription', label: 'Assinatura', icon: CreditCard },
=======
  { href: '/support', label: 'Suporte', icon: LifeBuoy },
>>>>>>> 5cd05fe (quero que voce crie uma pagina de suporte para o telefone 11957211546 -)
];

export const adminMenuItems = [
    { href: '/admin/generate-codes', label: 'Gerar Códigos', icon: Shield }
];
