"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Хук для определения, что компонент примонтирован на клиенте.
 * Решает проблему гидратации без нарушения правила react-hooks/set-state-in-effect.
 *
 * Использует useSyncExternalStore — рекомендованный React способ
 * различать серверный и клиентский рендеринг.
 *
 * @returns true после гидратации на клиенте, false при SSR
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // клиентский snapshot
    () => false, // серверный snapshot
  );
}
