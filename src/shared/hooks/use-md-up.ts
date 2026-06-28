"use client";

import { useSyncExternalStore } from "react";

const MD_MEDIA_QUERY = "(min-width: 768px)";

function subscribeMdUp(onStoreChange: () => void): () => void {
  const mq = window.matchMedia(MD_MEDIA_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMdUpSnapshot(): boolean {
  return window.matchMedia(MD_MEDIA_QUERY).matches;
}

export function useMdUp(): boolean {
  return useSyncExternalStore(subscribeMdUp, getMdUpSnapshot, () => false);
}
