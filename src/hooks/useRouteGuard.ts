'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore, useTenantStore } from '@/stores';
import type { TenantRole } from '@/types';

export function useRouteGuard(requiredRole?: TenantRole) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const tenant = useTenantStore((s) => s.tenant);

  useEffect(() => {
    if (!session?.authenticated) {
      router.replace('/login');
      return;
    }
    if (requiredRole && tenant) {
      const hierarchy: TenantRole[] = ['NORMAL_USER', 'DB_ADMIN', 'SUPER_USER'];
      const userLevel = hierarchy.indexOf(tenant.role);
      const requiredLevel = hierarchy.indexOf(requiredRole);
      if (userLevel < requiredLevel) {
        router.replace('/dashboard');
      }
    }
  }, [session, tenant, router, requiredRole]);

  return { session, tenant };
}

export function useAdminGuard() {
  return useRouteGuard('DB_ADMIN');
}

export function useSuperUserGuard() {
  return useRouteGuard('SUPER_USER');
}
