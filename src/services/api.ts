import axios from "axios";

// Função robusta para ler cookies (compatível com caracteres especiais e formatos variados)
function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) {
    return decodeURIComponent(match[2]);
  }
  return null;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true, // Importante para persistência de sessões
});

// Interceptor para injetar o token em cada request
api.interceptors.request.use((config) => {
  const token = getCookie("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de resposta para tratar erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401, significa que o token expirou ou é inválido
    if (error.response?.status === 401) {
      console.warn("Sessão inválida ou expirada.");

      // Opcional: Disparar um evento customizado para o AuthProvider ouvir e fazer logout
      if (typeof window !== "undefined") {
        // window.location.href = '/login'; // Cuidado: pode criar loop infinito se a página de login der 401
      }
    }
    return Promise.reject(error);
  }
);
