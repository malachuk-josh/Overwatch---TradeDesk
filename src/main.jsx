import React from "react";
import { createRoot } from "react-dom/client";
import Overwatch from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Overwatch />
  </React.StrictMode>,
);
