import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./routes/routes.jsx";
import AuthProvider from "./context/AuthProvider.jsx";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "./context/UserContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <AuthProvider>
        <RouterProvider router={router} />

        <Toaster
          position="top-right"
          gutter={10}
          containerStyle={{
            top: 76,
            right: 16,
          }}
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "12px",
              padding: "12px 14px",
              fontWeight: "500",
              fontSize: "14px",
              lineHeight: "1.4",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              border: "1px solid #e2e8f0",
              maxWidth: "360px",
            },

            duration: 4000,

            success: {
              duration: 3500,
              iconTheme: {
                primary: "#059669",
                secondary: "#ffffff"
              },
              style: {
                borderLeft: "4px solid #059669",
              },
            },

            error: {
              duration: 4500,
              iconTheme: {
                primary: "#dc2626",
                secondary: "#ffffff"
              },
              style: {
                borderLeft: "4px solid #dc2626",
              },
            },

            loading: {
              duration: Infinity,
              iconTheme: {
                primary: "#0284c7",
                secondary: "#e0f2fe",
              },
              style: {
                borderLeft: "4px solid #0284c7",
              },
            },
          }}
        />
      </AuthProvider>
    </UserProvider>
  </StrictMode>
);
