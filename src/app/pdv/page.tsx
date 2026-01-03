import { Metadata } from "next";
import { PDVInterface } from "./_components/pdvInterface";
import { PDVHeader } from "./_components/pdv-header";

export const metadata: Metadata = {
  title: { template: "%s | %s", default: "Frente de Caixa" },
  description: "Sistema de Ponto de Venda ágil e moderno.",
};

export default function PDVPage() {
  const date = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="h-screen w-full bg-muted overflow-hidden flex flex-col">
      <PDVHeader date={date} />

      <main className="flex-1 overflow-hidden">
        <PDVInterface />
      </main>
    </div>
  );
}
