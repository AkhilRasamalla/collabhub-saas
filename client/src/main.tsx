import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react";

import "./index.css";
import App from "./App";
import QueryProvider from "./context/query-provider";
import { AuthProvider } from "./context/auth-provider";
import { Toaster } from "./components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <NuqsAdapter>
            <App />
          </NuqsAdapter>
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>
);
