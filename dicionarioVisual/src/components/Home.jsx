import { Header } from "./Header";
import { WordPresentation } from "./WordPresentation";
import { WordsList } from "./WordsList";

export const Home = () => {
  const renderFooter = () => (
    <footer className="bg-[#2c3e50] text-white text-center p-2">
      Dicionário Visual de Palavras Polissêmicas © 2025 - Projeto de
      Acessibilidade e Inclusão Digital
    </footer>
  );

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex flex-row overflow-hidden">
        <div
          className="
            w-[300px] bg-[#f8f9fa] border-r border-gray-300
            overflow-y-auto flex-shrink-0
          "
        >
          <WordsList />
        </div>
        <div className="flex-1 flex items-center justify-center overflow-y-auto p-4">
          <WordPresentation />
        </div>
      </main>
      {renderFooter()}
    </div>
  );
};
