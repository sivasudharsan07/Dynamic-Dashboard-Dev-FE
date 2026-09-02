'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStore, useTenantStore, useSessionStore, logoutAll } from '@/stores';
import { Logo } from '@/components/common/Logo';
import {
  IconLayoutDashboard, IconDatabase, IconUpload, IconBook, IconBrain,
  IconUsers, IconNotes, IconBuildingSkyscraper, IconClipboardList,
  IconFileAnalytics, IconSun, IconMoon, IconChevronLeft, IconChevronRight,
  IconLogout, IconUser, IconMenu2,
} from '@tabler/icons-react';
import type { TenantRole } from '@/types';

// ---- Sidebar ----
type NavItem = { label: string; href: string; icon: React.ReactNode; roles: TenantRole[] };

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <IconLayoutDashboard size={18} />, roles: ['SUPER_USER', 'DB_ADMIN', 'NORMAL_USER'] },
  { label: 'Catalog', href: '/catalog', icon: <IconBook size={18} />, roles: ['SUPER_USER', 'DB_ADMIN', 'NORMAL_USER'] },
  { label: 'Reports', href: '/reports', icon: <IconFileAnalytics size={18} />, roles: ['SUPER_USER', 'DB_ADMIN', 'NORMAL_USER'] },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Sources', href: '/admin/sources', icon: <IconDatabase size={18} />, roles: ['SUPER_USER', 'DB_ADMIN'] },
  { label: 'Ingestion', href: '/admin/ingestion', icon: <IconUpload size={18} />, roles: ['SUPER_USER', 'DB_ADMIN'] },
  { label: 'Semantics', href: '/admin/semantics', icon: <IconBrain size={18} />, roles: ['SUPER_USER', 'DB_ADMIN'] },
  { label: 'Users', href: '/admin/users', icon: <IconUsers size={18} />, roles: ['SUPER_USER', 'DB_ADMIN'] },
  { label: 'Agent Logs', href: '/admin/agent-logs', icon: <IconNotes size={18} />, roles: ['SUPER_USER', 'DB_ADMIN'] },
  { label: 'Tenant', href: '/admin/tenant', icon: <IconBuildingSkyscraper size={18} />, roles: ['SUPER_USER', 'DB_ADMIN'] },
  { label: 'Audit', href: '/admin/audit', icon: <IconClipboardList size={18} />, roles: ['SUPER_USER', 'DB_ADMIN'] },
];

function canSee(item: NavItem, role: TenantRole) {
  return item.roles.includes(role);
}

type SidebarProps = { collapsed: boolean; onToggle: () => void; };

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tenant = useTenantStore((s) => s.tenant);
  const role: TenantRole = tenant?.role ?? 'NORMAL_USER';

  const visibleNav = NAV_ITEMS.filter((i) => canSee(i, role));
  const visibleAdmin = ADMIN_NAV_ITEMS.filter((i) => canSee(i, role));

  return (
    <aside className="sidebar" data-sidebar={collapsed ? 'collapsed' : 'expanded'} style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}>
      <div className="sidebar__header">
        {collapsed
          ? <Logo variant="icon" height={32} style={{ margin: '0 auto' }} />
          : <Logo variant="full" theme="auto" height={30} maxWidth={170} />
        }
        <button className="icon-button" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} style={{ marginLeft: collapsed ? 0 : 'auto', flexShrink: 0 }}>
          {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {visibleNav.map((item) => (
          <button
            key={item.href}
            className="sidebar__item"
            data-active={pathname === item.href ? 'true' : 'false'}
            onClick={() => router.push(item.href)}
            aria-current={pathname === item.href ? 'page' : undefined}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span className="sidebar__item-label">{item.label}</span>}
          </button>
        ))}

        {visibleAdmin.length > 0 && (
          <>
            {!collapsed && <div className="sidebar__section-label">Administration</div>}
            {visibleAdmin.map((item) => (
              <button
                key={item.href}
                className="sidebar__item"
                data-active={pathname.startsWith(item.href) ? 'true' : 'false'}
                onClick={() => router.push(item.href)}
                aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span className="sidebar__item-label">{item.label}</span>}
              </button>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}

// ---- Header ----
type HeaderProps = { onMenuClick?: () => void; };

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggle } = useThemeStore();
  const tenant = useTenantStore((s) => s.tenant);
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logoutAll();
    router.push('/login');
  };

  return (
    <header className="app-header">
      <div className="app-header__left">
        {onMenuClick && (
          <button className="icon-button" onClick={onMenuClick} aria-label="Toggle menu">
            <IconMenu2 size={18} />
          </button>
        )}
      </div>

      <span className="app-header__tenant">{tenant?.tenantName ?? 'Dynamic Dashboard'}</span>

      <div className="app-header__actions">
        <button className="icon-button" onClick={toggle} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
          {theme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
        </button>

        <div style={{ position: 'relative' }}>
          <button className="icon-button" onClick={() => setProfileOpen((o) => !o)} aria-label="Profile menu" id="profile-menu-btn">
            <IconUser size={18} />
          </button>
          {profileOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '110%', zIndex: 200, minWidth: '11rem',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 'var(--space-2)',
            }}>
              <div style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-1)' }}>
                <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>{tenant?.userId ?? 'User'}</div>
                <div>{tenant?.role}</div>
              </div>
              <button className="sidebar__item" style={{ width: '100%' }} onClick={handleLogout}>
                <IconLogout size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ---- App Shell ----
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell" data-sidebar={collapsed ? 'collapsed' : 'expanded'}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="app-main">
        <Header />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
