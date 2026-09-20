import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { queryClient } from "../../lib/queryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default QueryProvider;
