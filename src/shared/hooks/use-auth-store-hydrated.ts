"use client";

import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/shared/store/auth-store";

function subscribe(onStoreChange: () => void) {
  const unsubFinish = useAuthStore.persist.onFinishHydration(() => {
    onStoreChange();
  });
  if (useAuthStore.persist.hasHydrated()) {
    onStoreChange();
  }
  return unsubFinish;
}

function getSnapshot() {
  return useAuthStore.persist.hasHydrated();
}

function getServerSnapshot() {
  return false;
}

/** True once `persist` has merged localStorage into the auth store. */
export function useAuthStoreHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
