import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { AdminPortalLogin } from "./AdminPortal/components/AdminPortalLogin";
import { AdminPortalHome } from "./AdminPortal/components/AdminPortalHome";
import { PrivateRoute } from "./PrivateRoute";

export const DicionarioVisual = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-portal/login" element={<AdminPortalLogin />} />
        <Route
          path="/admin-portal/home"
          element={
            <PrivateRoute>
              <AdminPortalHome />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
