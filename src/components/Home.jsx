import { useState } from "react";
import { Header } from "./Header";
import { WordsList } from "../Dictionary/components/WordsList";
import { WordPresentation } from "../Dictionary/components/WordPresentation";

export const Home = () => {
  const [searchedWord, setSearchedWord] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);

  const renderFooter = () => (
    <footer className="bg-[#2c3e50] text-white text-center p-2">
      Dicionário Visual de Palavras Polissêmicas © 2025 - Projeto de
      Acessibilidade e Inclusão Digital
    </footer>
  );

  return (
    <div className="flex flex-col h-screen">
      <Header
        onIconClick={() => setSelectedWord(null)}
        setSearchedWord={setSearchedWord}
      />
      <main className="flex flex-row overflow-hidden flex-1">
        <div
          className="
            w-[300px] bg-[#f8f9fa] border-r border-gray-300
            overflow-y-auto flex-shrink-0
          "
        >
          <WordsList
            setSelectedWord={setSelectedWord}
            isHome={!selectedWord}
            searchedWord={searchedWord}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <WordPresentation selectedWord={selectedWord} />
        </div>
      </main>
      {renderFooter()}
    </div>
  );
};
