import React, { createContext, useMemo } from "react";
import { createHevyClient, type HevyClient } from "../../client/client";

export const HevyContext = createContext<HevyClient | null>(null);

export function HevyProdiver({
  children,
  apiKey,
  altUrl,
}: {
  children: React.ReactNode;
  apiKey: string;
  altUrl?: string;
}) {
  const client = useMemo(
    () => createHevyClient({ apiKey, altBaseUrl: altUrl }),
    [apiKey, altUrl],
  );
  return <HevyContext.Provider value={client}>{children}</HevyContext.Provider>;
}
