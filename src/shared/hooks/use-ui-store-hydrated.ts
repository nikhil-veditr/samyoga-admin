"use client";

import { useSyncExternalStore } from "react";
import { useUiStore } from "@/shared/store/ui-store";

function subscribe(onStoreChange: () => void) {
  const unsubFinish = useUiStore.persist.onFinishHydration(() => {
    onStoreChange();
  });
  if (useUiStore.persist.hasHydrated()) {
    onStoreChange();
  }
  return unsubFinish;
}

function getSnapshot() {
  return useUiStore.persist.hasHydrated();
}

function getServerSnapshot() {
  return false;
}

/** True once `persist` has merged localStorage into the UI store (theme, etc.). */
export function useUiStoreHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
