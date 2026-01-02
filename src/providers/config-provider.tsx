"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Config } from "@/types/config";
import { configService } from "@/services/config.service";
import { useTheme } from "next-themes";

interface ConfigContextType {
  config: Config | null;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  isLoading: true,
  refreshConfig: async () => {},
});

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { setTheme } = useTheme();

  const fetchConfig = async () => {
    try {
      const data = await configService.get();
      setConfig(data);
      if (data && data.theme) {
        setTheme(data.theme);
      }
    } catch (error) {
      console.error("Failed to load config provider", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider
      value={{ config, isLoading, refreshConfig: fetchConfig }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
