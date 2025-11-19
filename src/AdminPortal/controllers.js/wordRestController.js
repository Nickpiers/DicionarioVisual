import { requestEndpoint } from "./requestController";

export const uploadWord = async () => {
  const request = {
    restParams: { uri: "", params: {} },
    method: "POST",
  };
  try {
    await requestEndpoint(request);
  } catch (error) {
    throw new Error("Erro ao fazer upload de palavra: ", error);
  }
};

export const retrieveWords = async () => {
  const request = {
    restParams: { uri: "" },
  };
  try {
    const words = await requestEndpoint(request);
    console.warn(words, "words");
  } catch (error) {
    throw new Error("Erro ao recuperar palavras: ", error);
  }
};
