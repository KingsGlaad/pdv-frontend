import { api } from "./api";
import { Config, UpdateConfigDto } from "@/types/config";

export const configService = {
  async get() {
    // Fallback to default if API fails (or for initial dev)
    try {
      const { data } = await api.get<Config>("/config");
      return data;
    } catch (error) {
      console.warn("Failed to fetch config, returning default", error);
      return {
        id: "default",
        appName: "PDV App",
        theme: "system",
        currency: "BRL",
        logoUrl: null,
      } as Config;
    }
  },

  async update(dto: UpdateConfigDto) {
    const { data } = await api.patch<Config>("/config", dto);
    return data;
  },

  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    // Assumes backend endpoint /upload/logo returns { url: string }
    const { data } = await api.post<{ url: string }>("/upload/logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.url;
  },
};
