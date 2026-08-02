import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { LangProvider } from "./lang.jsx";
import "./site.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* basename keeps routing correct when Pages serves from /AlShatherOne/ */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <LangProvider>
        <App />
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
);
