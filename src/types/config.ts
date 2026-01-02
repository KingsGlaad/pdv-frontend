export interface Config {
  id: string;
  appName: string;
  logoUrl?: string | null;
  theme: "light" | "dark" | "system";
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateConfigDto {
  appName?: string;
  theme?: "light" | "dark" | "system";
  currency?: string;
  logoUrl?: string; // URL after upload
}
