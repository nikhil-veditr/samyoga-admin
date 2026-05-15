"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Server and static rendering: assume light until hydrated (inline layout script sets data-theme earlier). */
function getServerSnapshot() {
  return false;
}

export function useSystemDark() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
