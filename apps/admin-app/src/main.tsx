import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { getConvexUrl } from "@marlion/config";
import { initializeFirebase } from "@marlion/firebase";
import App from "./App";
import "@marlion/ui/styles";
import "./index.css";

// Initialize Firebase
initializeFirebase();

// Initialize Convex
const convex = new ConvexReactClient(getConvexUrl() || "");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProvider>
  </React.StrictMode>
);
