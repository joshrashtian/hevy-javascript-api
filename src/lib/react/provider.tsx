import { createContext, useMemo, type ReactNode } from "react";
import {
  createHevyClient,
  type HevyClient,
  type HevyClientOptions,
} from "../../client/client";

export const HevyContext = createContext<HevyClient | null>(null);

export function HevyProvider({
  children,
  apiKey,
  altBaseUrl,
}: HevyClientOptions & { children: ReactNode }) {
  const client = useMemo(
    () => createHevyClient({ apiKey, altBaseUrl }),
    [apiKey, altBaseUrl],
  );
  return <HevyContext.Provider value={client}>{children}</HevyContext.Provider>;
}
