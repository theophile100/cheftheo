"use client";

import { createContext, useContext } from "react";

const LogoContext = createContext<string>("/logo.svg");

export function LogoProvider({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return <LogoContext.Provider value={url}>{children}</LogoContext.Provider>;
}

export function useLogo() {
  return useContext(LogoContext);
}
