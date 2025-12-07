/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { retrieveWords } from "../../AdminPortal/controllers.js/wordRestController";
import { formattedWordInformation } from "../controllers/wordsController";

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

  const selectedStyle = (index) => {
    return selected === index
      ? "bg-blue-100 border-blue-500"
      : "hover:bg-gray-100 border-transparent";
  };

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
      <div className="flex justify-center items-center h-40">
        <div className="w-12 h-12 border-4 border-blue-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="word-list flex flex-col items-center justify-center">
      {wordNotFound ? (
        <div className="text-gray-500 text-xl font-semibold py-10">
          Palavra não encontrada
        </div>
      ) : (
        filteredWords.map((item, index) => (
          <div
            key={index}
            onClick={() => selectWord(index, item)}
            className={`
            px-6 py-4 cursor-pointer text-lg font-medium border-l-5 w-full
            ${selectedStyle(index)}
          `}
          >
            {item.word}
          </div>
        ))
      )}
    </div>
  );
};
