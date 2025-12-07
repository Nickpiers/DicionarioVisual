/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { retrieveWords } from "../../AdminPortal/controllers.js/wordRestController";
import { formattedWordInformation } from "../controllers/wordsController";
import "../style/WordsList.css";

export const WordsList = ({ setSelectedWord, isHome, searchedWord }) => {
  const [selected, setSelected] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wordNotFound, setWordNotFound] = useState(false);

  const selectWord = (index, item) => {
    setSelected(index);
    setSelectedWord(item);
  };

  const filteredWords = searchedWord
    ? words.filter((item) =>
        item.word.toLowerCase().includes(searchedWord.toLowerCase())
      )
    : words;

  useEffect(() => {
    const loadWords = async () => {
      try {
        const loadedWords = await retrieveWords();
        const wordsFormatted = formattedWordInformation(loadedWords);
        setWords(wordsFormatted);
        setLoading(false);
      } catch (error) {
        console.log("Erro ao recuperar palavras", error);
      }
    };
    loadWords();
  }, []);

  useEffect(() => {
    if (isHome) setSelected(null);
  }, [isHome]);

  useEffect(() => {
    if (searchedWord) {
      if (filteredWords.length > 0) {
        setWordNotFound(false);
        setSelected(0);
        setSelectedWord(filteredWords[0]);
      } else {
        setWordNotFound(true);
        setSelectedWord(null);
      }
    }
  }, [searchedWord]);

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
      </div>
    );

  return (
    <div className="word-list">
      {wordNotFound ? (
        <div className="word-not-found">Palavra não encontrada</div>
      ) : (
        filteredWords.map((item, index) => (
          <button
            key={index}
            onClick={() => selectWord(index, item)}
            className={`word-item ${selected === index ? "selected" : ""}`}
          >
            {item.word}
          </button>
        ))
      )}
    </div>
  );
};
