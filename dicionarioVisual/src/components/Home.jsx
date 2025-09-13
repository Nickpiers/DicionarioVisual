import "../style/Home.css";
import { Header } from "./Header";

export const Home = () => {
  const renderizaFooter = () => (
    <div
      className="fixed bottom-0 w-full text-center p-2 bg-[#2c3e50] text-white text-lg"
      id="footer"
    >
      <p>
        Dicionário Visual de Palavras Polissêmicas &copy; 2025 - Projeto de
        Acessibilidade e Inclusão Digital
      </p>
    </div>
  );

  return (
    <>
      <Header />
      {renderizaFooter()}
    </>
  );
};
