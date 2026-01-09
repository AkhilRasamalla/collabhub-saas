import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NuqsAdapter } from "nuqs/adapters/react";

import "./index.css";
import App from "./App.tsx";
import QueryProvider from "./context/query-provider.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { AuthProvider } from "./context/auth-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <NuqsAdapter>
          <App />
        </NuqsAdapter>
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  </StrictMode>
);
