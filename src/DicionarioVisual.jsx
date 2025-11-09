import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { AdminPortalHome } from "./AdminPortal/components/AdminPortalHome";

export const DicionarioVisual = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-portal" element={<AdminPortalHome />} />
      </Routes>
    </BrowserRouter>
  );
};
