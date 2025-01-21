import { type inferRouterOutputs } from "@trpc/server";
import React, { createContext, useContext } from "react";
import { type appSettingsRouter } from "~/server/api/routers/app";
import { api } from "~/utils/api";

const AppSettingValidator = createContext<{
  open: boolean;
  settings: inferRouterOutputs<typeof appSettingsRouter>["getAppSettings"] | null;
}>({
  open: true,
  settings: null,
});

function Provider({
  value,
  children,
}: {
  value?: boolean;
  children: React.ReactNode;
}) {
  const settings = api.appSettings.getAppSettings.useQuery();

  return (
    <AppSettingValidator.Provider value={{
      open: value ?? true,
      settings: settings.data ?? null,
    }}>
      {children}
    </AppSettingValidator.Provider>
  );
}

function Active({ children }: { children: React.ReactNode }) {
  const ctx = useContext(AppSettingValidator);

  if (ctx.open) {
    return <>{children}</>;
  }
  return <></>;
}

function FallBack({ children }: { children: React.ReactNode }) {
  const ctx = useContext(AppSettingValidator);

  if (!ctx.open) {
    return <>{children}</>;
  } else {
    return <></>;
  }
}

export { AppSettingValidator as context, Provider, Active, FallBack };