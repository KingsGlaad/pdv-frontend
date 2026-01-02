"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { configService } from "@/services/config.service";

const configSchema = z.object({
  appName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  theme: z.enum(["light", "dark", "system"]),
  currency: z.string().min(1, "Selecione uma moeda"),
  logoUrl: z.string().optional().nullable(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

export function SettingsForm() {
  const { setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      appName: "",
      theme: "system",
      currency: "BRL",
      logoUrl: "",
    },
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await configService.get();
        form.reset({
          appName: config.appName,
          theme: config.theme as "light" | "dark" | "system",
          currency: config.currency,
          logoUrl: config.logoUrl,
        });
        if (config.logoUrl) {
          setPreviewUrl(config.logoUrl);
        }
      } catch (error) {
        toast.error("Erro ao carregar configurações");
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  async function onSubmit(data: ConfigFormValues) {
    setSaving(true);
    try {
      let finalLogoUrl = data.logoUrl;

      if (logoFile) {
        // Upload logo first if changed
        try {
          // In a real scenario, we would upload here.
          // Since backend is not implemented, we mock the URL return or assume service handles it.
          // But `configService.uploadLogo` is implemented to call API.
          // If API fails (404), we might want to just proceed or warn.
          finalLogoUrl = await configService.uploadLogo(logoFile);
        } catch (e) {
          console.error("Upload failed", e);
          toast.warning(
            "Não foi possível fazer o upload da logo. Salvando outras configurações."
          );
          // Keep original or empty if upload fails?
          // If local preview exists, maybe we can't save it remotely yet.
        }
      }

      await configService.update({
        ...data,
        logoUrl: finalLogoUrl || undefined,
      });

      // Update local theme immediately to match preference
      setTheme(data.theme);

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identidade Visual</CardTitle>
            <CardDescription>
              Personalize o nome e o logo da sua aplicação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="appName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Aplicação</FormLabel>
                  <FormControl>
                    <Input placeholder="PDV App" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Logo</FormLabel>
              <div className="flex items-center gap-4">
                {previewUrl && (
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Logo Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <FormDescription>
                    Recomendado: 512x512px, PNG ou JPG.
                  </FormDescription>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferências Gerais</CardTitle>
            <CardDescription>Ajuste o tema e a moeda padrão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      {...field}
                    >
                      <option value="system">Sistema</option>
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      {...field}
                    >
                      <option value="BRL">Real Brasileiro (BRL)</option>
                      <option value="USD">Dólar Americano (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Form>
  );
}
