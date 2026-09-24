import { useContext } from "react";
import { HevyContext } from "./provider";

export function useHevy() {
  const client = useContext(HevyContext);
  if (!client) throw new Error("useHevy must be used inside <HevyProvider>");
  return client;
}
