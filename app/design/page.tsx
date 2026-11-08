'use client';

import { useEffect, useState } from 'react';
import { LiveRiseFall } from '@/components/live-rise-fall';
import {
  ALL_BLOCK_KEYS,
  DEFAULT_APP_CONFIG,
  normalizeAppConfig,
  type BlockKey,
  type ControlKey,
  type RiseFallAppConfig,
  type StyleVariant,
} from '@/lib/app-config';

const STORAGE_KEY = 'peter-nganga-design-config';

const CONTROL_LABELS: Record<ControlKey, string> = {
  riseFall: 'Rise / Fall control',
  allowEquals: 'Allow equals control',
  stake: 'Stake control',
  duration: 'Duration control',
  buy: 'Buy button',
};

const BLOCK_LABELS: Record<BlockKey, string> = {
  chart: 'Chart and symbol selector',
  ...CONTROL_LABELS,
};

export default function DesignPage() {
  const [config, setConfig] = useState<RiseFallAppConfig>(DEFAULT_APP_CONFIG);
  const [loaded, setLoaded] = useState(false);
  const [designMode, setDesignMode] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setConfig(normalizeAppConfig(JSON.parse(saved)));
    } catch {
      // Ignore malformed or unavailable browser storage and use safe defaults.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // The design still works for this page view if storage is unavailable.
    }
  }, [config, loaded]);

  function setStyle(key: ControlKey, style: StyleVariant) {
    setConfig((current) => ({
      ...current,
      styles: { ...current.styles, [key]: style },
    }));
  }

  function moveBlock(key: BlockKey, offset: -1 | 1) {
    setConfig((current) => {
      const order = [...current.order];
      const from = order.indexOf(key);
      const to = from + offset;
      if (from < 0 || to < 0 || to >= order.length) return current;
      [order[from], order[to]] = [order[to], order[from]];
      return { ...current, order };
    });
  }

  function resetDesign() {
    setConfig(DEFAULT_APP_CONFIG);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Reset the in-memory design even if storage is unavailable.
    }
  }

  return (
    <main className="min-h-dvh bg-background p-3 text-foreground sm:p-6">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Peter Nganga · Deriv
            </p>
            <h1 className="mt-1 text-2xl font-bold">Design panel</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Customize the Rise/Fall app preview. Your settings are saved in this browser.
            </p>
          </div>

          <section className="space-y-3" aria-labelledby="style-heading">
            <h2 id="style-heading" className="text-sm font-semibold">Control styles</h2>
            {(Object.keys(CONTROL_LABELS) as ControlKey[]).map((key) => (
              <div key={key} className="rounded-lg border p-3">
                <p className="mb-2 text-sm">{CONTROL_LABELS[key]}</p>
                <div className="flex gap-2" role="group" aria-label={`${CONTROL_LABELS[key]} style`}>
                  {(['a', 'b', 'c'] as StyleVariant[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      aria-pressed={config.styles[key] === style}
                      onClick={() => setStyle(key, style)}
                      className={`min-h-10 flex-1 rounded-md border text-sm font-medium ${
                        config.styles[key] === style
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      Style {style.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="mt-5 space-y-3 border-t pt-4" aria-labelledby="layout-heading">
            <h2 id="layout-heading" className="text-sm font-semibold">Layout options</h2>
            <label className="flex min-h-11 items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <span>Show price chart</span>
              <input
                type="checkbox"
                checked={!config.chart.hidden}
                onChange={(event) => setConfig((current) => ({
                  ...current,
                  chart: { hidden: !event.target.checked },
                }))}
                className="h-4 w-4 accent-primary"
              />
            </label>
            <label className="flex min-h-11 items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <span>Pin Buy button on mobile</span>
              <input
                type="checkbox"
                checked={config.buy.pinned}
                onChange={(event) => setConfig((current) => ({
                  ...current,
                  buy: { pinned: event.target.checked },
                }))}
                className="h-4 w-4 accent-primary"
              />
            </label>
          </section>

          <section className="mt-5 space-y-3 border-t pt-4" aria-labelledby="order-heading">
            <h2 id="order-heading" className="text-sm font-semibold">Block order</h2>
            <ol className="space-y-2">
              {config.order.map((key, index) => (
                <li key={key} className="flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2">
                  <span className="min-w-0 flex-1 text-sm">{index + 1}. {BLOCK_LABELS[key]}</span>
                  <button
                    type="button"
                    onClick={() => moveBlock(key, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${BLOCK_LABELS[key]} up`}
                    className="h-8 w-8 rounded border disabled:opacity-40"
                  >↑</button>
                  <button
                    type="button"
                    onClick={() => moveBlock(key, 1)}
                    disabled={index === config.order.length - 1}
                    aria-label={`Move ${BLOCK_LABELS[key]} down`}
                    className="h-8 w-8 rounded border disabled:opacity-40"
                  >↓</button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setConfig((current) => ({ ...current, order: [...ALL_BLOCK_KEYS] }))}
              className="min-h-10 w-full rounded-md border px-3 text-sm hover:bg-muted"
            >Restore default order</button>
          </section>

          <div className="mt-5 grid grid-cols-2 gap-2 border-t pt-4">
            <button
              type="button"
              onClick={resetDesign}
              className="min-h-11 rounded-md border px-3 text-sm hover:bg-muted"
            >Reset all</button>
            <button
              type="button"
              onClick={() => setDesignMode((mode) => !mode)}
              className="min-h-11 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
            >{designMode ? 'Use live app' : 'Edit design'}</button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
            {designMode
              ? 'Design mode: trading controls are disabled in the preview.'
              : 'Live mode: Deriv login and trading controls are enabled.'}
          </p>
        </aside>

        <section className="min-h-[70dvh] overflow-hidden rounded-xl border bg-background" aria-label="Live Deriv app preview">
          <LiveRiseFall
            appConfig={config}
            editMode={designMode}
            onSelect={() => undefined}
            selectedKey={null}
            rearrangeMode={false}
            onReorder={(order) => setConfig((current) => ({ ...current, order }))}
          />
        </section>
      </div>
    </main>
  );
}
