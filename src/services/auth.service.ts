import { api } from "./api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data } = await api.post("/auth/signin", { email, password });
    return data;
  },

  async signOut() {
    await api.post("/auth/signout");
  },

  async me() {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};
