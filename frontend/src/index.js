import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Router from "./routes/routes";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <Router />
    </BrowserRouter>
  </React.StrictMode>
);
