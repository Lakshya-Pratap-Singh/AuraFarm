import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext.jsx";
import { XPProvider } from "./context/XPContext.jsx";
import { BannerProvider } from "./context/BannerContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <XPProvider>
        <BannerProvider>
          <App />
        </BannerProvider>
      </XPProvider>
    </AuthProvider>
  </BrowserRouter>
);