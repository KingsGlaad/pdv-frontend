export interface Config {
  id: string;
  appName: string;
  logoUrl?: string | null;
  theme: "light" | "dark" | "system";
  currency: string;
  companyName?: string;
  tradingName?: string;
  cnpj?: string;
  stateRegistration?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateConfigDto {
  id?: string;
  appName?: string;
  theme?: "light" | "dark" | "system";
  currency?: string;
  logoUrl?: string | null; // URL after upload
  companyName?: string;
  tradingName?: string;
  cnpj?: string;
  stateRegistration?: string;
  phone?: string;
  email?: string;
  address?: string;
}
