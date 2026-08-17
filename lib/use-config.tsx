'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { siteConfig as fallbackConfig, coupons as fallbackCoupons } from '@/lib/config';
import type { SiteConfig, Coupon } from '@/lib/types';

interface ConfigState {
  config: SiteConfig;
  coupons: Coupon[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const ConfigContext = createContext<ConfigState>({
  config: fallbackConfig,
  coupons: fallbackCoupons,
  loading: true,
  refresh: async () => {},
});

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(fallbackConfig);
  const [coupons, setCoupons] = useState<Coupon[]>(fallbackCoupons);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const [configRes, couponsRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/coupons'),
      ]);
      const configData = await configRes.json();
      const couponsData = await couponsRes.json();
      if (configData.config) setConfig(configData.config);
      if (couponsData.coupons) setCoupons(couponsData.coupons);
    } catch {
      // fallback already set
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <ConfigContext.Provider value={{ config, coupons, loading, refresh }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
