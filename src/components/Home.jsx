import { useState } from "react";
import { Header } from "./Header";
import { WordsList } from "../Dictionary/components/WordsList";
import { WordPresentation } from "../Dictionary/components/WordPresentation";
import { useNavigate } from "react-router-dom";
import { paths } from "../controllers/paths";
import { TITLE_DICTIONARY } from "../controllers/constants";
import "../style/Home.css";

export const Home = () => {
  const navigate = useNavigate();
  const [searchedWord, setSearchedWord] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);

  return (
    <div className="home-container">
      <Header
        onIconClick={() => setSelectedWord(null)}
        setSelectedWord={setSelectedWord}
        setSearchedWord={setSearchedWord}
        redirectAction={() => navigate(paths.adminPortalLogin)}
        headerTitle={TITLE_DICTIONARY}
      />

      <main className="main-content">
        <div className="sidebar">
          <WordsList
            setSelectedWord={setSelectedWord}
            isHome={!selectedWord}
            searchedWord={searchedWord}
          />
        </div>

        <div className="presentation-area">
          <WordPresentation
            selectedWord={selectedWord}
            searchedWord={searchedWord}
          />
        </div>
      </main>

      <footer className="footer">
        Dicionário Visual de Palavras Polissêmicas © 2025 - Projeto de
        Acessibilidade e Inclusão Digital
      </footer>
    </div>
  );
};
