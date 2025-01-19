import React, { createContext, useContext, useState } from "react";

const AppSettingValidator = createContext(true);

function Provider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  const [open] = useState(value);

  return (
    <AppSettingValidator.Provider value={open}>
      {children}
    </AppSettingValidator.Provider>
  );
}

function Active({ children }: { children: React.ReactNode }) {
  const open = useContext(AppSettingValidator);

  if (open) {
    return <>{children}</>;
  }
  return <></>;
}

function FallBack({ children }: { children: React.ReactNode }) {
  const open = useContext(AppSettingValidator);

  if (!open) {
    return <>{children}</>;
  } else {
    return <></>;
  }
}

export { Provider, Active, FallBack };