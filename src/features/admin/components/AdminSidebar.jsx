import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store, Package, Flag, ScrollText, FolderOpen
} from 'lucide-react';
import { cn } from '@lib/utils';

const links = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users',    icon: Users,           label: 'Users' },
  { to: '/admin/stores',   icon: Store,           label: 'Stores' },
  { to: '/admin/products', icon: Package,         label: 'Products' },
  { to: '/admin/reports',  icon: Flag,            label: 'Reports' },
  { to: '/admin/logs',     icon: ScrollText,      label: 'Logs' },
  { to: '/admin/categories', icon: FolderOpen,    label: 'Categories' },
];

export default function AdminSidebar({ onNavigate }) {
  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider mb-4 px-3" style={{ color: 'var(--color-text-muted)' }}>
        Admin Panel
      </p>
      {links.map(({ to, icon: Icon, label, end }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate}
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            isActive ? 'text-white' : 'hover:bg-[var(--glass-bg-strong)]'
          )}
          style={({ isActive }) => ({
            background: isActive ? 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))' : undefined,
            color: isActive ? 'white' : 'var(--color-text-secondary)',
            boxShadow: isActive ? 'var(--shadow-brand)' : undefined,
          })}
        >
          <Icon size={18} />{label}
        </NavLink>
      ))}
    </nav>
  );
}