import { Metadata } from "next";
import { SettingsForm } from "./_components/settings-form";

export const metadata: Metadata = {
  title: "Configurações | PDV",
  description: "Gerencie as configurações da aplicação",
};

export default function ConfigurationPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie a identidade visual e preferências do sistema.
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-4xl">
        <SettingsForm />
      </div>
    </div>
  );
}
