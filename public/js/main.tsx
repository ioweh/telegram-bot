import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import ReactDOM from "react-dom/client";
import TelegramGrid from "./components/TelegramGrid";
import AddAccount from "./components/AddAccount";

const MainComponent = (): JSX.Element => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/view" element={<TelegramGrid />} />
        <Route path="/add" element={<AddAccount />} />
        <Route path="/" element={<TelegramGrid />} />
      </Routes>
    </HashRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("container"));
root.render(<MainComponent />);
