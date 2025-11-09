import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";

export const DicionarioVisual = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/pathExemplo" element={<PathExemplo />} /> */}
      </Routes>
    </BrowserRouter>
  );
};
