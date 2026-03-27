import { syncGoldPrices } from "@/lib/gold-price-sync";

const globalForGoldSync = globalThis as unknown as {
  goldPriceAutoSyncStarted?: boolean;
  goldPriceAutoSyncTimer?: ReturnType<typeof setInterval>;
};

function getIntervalMs() {
  const minutes = Number(process.env.GOLD_PRICE_SYNC_MINUTES || 60);
  const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : 60;
  return safeMinutes * 60 * 1000;
}

async function runSyncOnce() {
  try {
    await syncGoldPrices(true);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const detail = error instanceof Error ? error.message : "unknown";
      console.error("[gold-price-auto-sync] sync failed:", detail);
    }
  }
}

export function ensureGoldPriceAutoSyncStarted() {
  if (globalForGoldSync.goldPriceAutoSyncStarted) {
    return;
  }

  globalForGoldSync.goldPriceAutoSyncStarted = true;

  // Run immediately on first backend hit, then keep syncing periodically.
  void runSyncOnce();

  const timer = setInterval(() => {
    void runSyncOnce();
  }, getIntervalMs());

  timer.unref?.();
  globalForGoldSync.goldPriceAutoSyncTimer = timer;
}
