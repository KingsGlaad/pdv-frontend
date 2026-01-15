"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, FileText, Video } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Central de Ajuda</h2>
        <p className="text-muted-foreground">
          Encontre respostas para suas dúvidas e entre em contato com o suporte.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* FAQ Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
            <CardDescription>
              Respostas rápidas para as dúvidas mais comuns sobre o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  Como cadastrar um novo produto?
                </AccordionTrigger>
                <AccordionContent>
                  Para cadastrar um novo produto, vá até a aba{" "}
                  <strong>Gestão &gt; Produtos</strong> no menu lateral e clique
                  no botão <strong>Novo Produto</strong> no canto superior
                  direito. Preencha os dados obrigatórios e salve.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Como realizar uma venda no PDV?
                </AccordionTrigger>
                <AccordionContent>
                  Acesse a opção <strong>PDV &gt; Frente de Caixa</strong> no
                  menu. Adicione os produtos pelo código de barras ou nome,
                  selecione a forma de pagamento e finalize a venda.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  Como configurar a impressora térmica?
                </AccordionTrigger>
                <AccordionContent>
                  No PDV, clique no ícone de engrenagem (Configurações).
                  Selecione a impressora desejada na lista e realize um teste de
                  impressão para confirmar a conexão.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>
                  Como visualizar o relatório de vendas?
                </AccordionTrigger>
                <AccordionContent>
                  Vá até <strong>Gestão &gt; Vendas</strong> para ver o
                  histórico de vendas. O relatório detalhado com gráficos está
                  em desenvolvimento e estará disponível em breve na aba{" "}
                  <strong>Financeiro</strong>.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Support Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Canais de Suporte</CardTitle>
            <CardDescription>
              Entre em contato diretamente com nossa equipe técnica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-md border p-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <div className="flex-1">
                <p className="font-medium">WhatsApp</p>
                <p className="text-sm text-muted-foreground">
                  Suporte rápido em horário comercial
                </p>
              </div>
              <Button variant="outline" size="sm">
                Abrir
              </Button>
            </div>
            <div className="flex items-center gap-4 rounded-md border p-4">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">E-mail</p>
                <p className="text-sm text-muted-foreground">
                  suporte@costelasystem.com.br
                </p>
              </div>
              <Button variant="outline" size="sm">
                Copiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos Adicionais</CardTitle>
            <CardDescription>
              Manuais e tutoriais para aproveitar ao máximo o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Manual do Usuário</p>
                <p className="text-xs text-muted-foreground">
                  PDF Completo • v1.0
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Tutoriais em Vídeo</p>
                <p className="text-xs text-muted-foreground">
                  Playlist Youtube
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
