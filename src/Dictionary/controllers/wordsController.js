export const formattedWordInformation = (words) => {
  return words.map((item) => {
    const meanings = item.meanings.map((meaning) => ({
      definition: meaning.description,
      example: meaning.example,
    }));

    return {
      word: item.term,
      video: item.videoUrl,
      meanings,
    };
  });
};
