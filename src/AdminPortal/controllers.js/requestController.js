import axios from "axios";

const api = axios.create({
  baseURL: "/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message === "Invalid or expired token") {
      alert("Sessão expirada. Faça login novamente.");
      localStorage.removeItem("token");
      window.location.href = "/admin-portal/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Base de requests
export const requestEndpoint = async ({
  restParams,
  method = "GET",
  isLogin = false,
}) => {
  const token = localStorage.getItem("token");
  if (!token && !isLogin) return;

  const { uri, params } = restParams;
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const hasBody = ["POST", "PUT"].includes(method.toUpperCase());

    const response = hasBody
      ? await api[method.toLowerCase()](uri, params, config)
      : await api[method.toLowerCase()](uri, { ...config, params });

    return response.data;
  } catch (err) {
    console.warn(`Erro ${uri}:`, err);
  }
};
