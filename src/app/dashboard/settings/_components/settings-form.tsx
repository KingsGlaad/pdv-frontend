"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Loader2, Search, Upload } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { configService } from "@/services/config.service";
import { api } from "@/services/api";
import { Separator } from "@/components/ui/separator";

const configSchema = z.object({
  appName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  theme: z.enum(["light", "dark", "system"]),
  currency: z.string().min(1, "Selecione uma moeda"),
  logoUrl: z.string().optional().nullable(),

  // Company Info
  companyName: z.string().optional(),
  tradingName: z.string().optional(),
  cnpj: z.string().optional(),
  stateRegistration: z.string().optional(),
  phone: z.string().optional(),
  email: z.email("E-mail inválido").optional().or(z.literal("")),
  address: z.string().optional(),
});

type SettingsValues = z.infer<typeof configSchema>;

export function SettingsForm() {
  const { setTheme } = useTheme();
  // const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchingCnpj, setSearchingCnpj] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // const [configId, setConfigId] = useState<string | undefined>(undefined);

  const form = useForm<SettingsValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      appName: "",
      theme: "system",
      currency: "BRL",
      logoUrl: "",
      companyName: "",
      tradingName: "",
      cnpj: "",
      stateRegistration: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await configService.get();

        if (!config) return;

        // setConfigId(config.id);
        const validThemes = ["light", "dark", "system"];
        const theme = validThemes.includes(config.theme)
          ? config.theme
          : "system";

        form.reset({
          appName: config.appName || "",
          theme: theme as "light" | "dark" | "system",
          currency: config.currency || "BRL",
          logoUrl: config.logoUrl || "",
          cnpj: config.cnpj || "",
          stateRegistration: config.stateRegistration || "",
          phone: config.phone || "",
          companyName: config.companyName || "",
          tradingName: config.tradingName || "",
          address: config.address || "",
          email: config.email || "",
        });
        if (config.logoUrl) {
          setPreviewUrl(config.logoUrl);
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar configurações");
      } finally {
        // setLoading(false);
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
    } else {
      setLogoFile(null);
      setPreviewUrl(null);
    }
  };

  async function onSubmit(data: SettingsValues) {
    setSaving(true);
    try {
      if (logoFile) {
        // Upload logic here if separate
        const uploadedLogoUrl = await configService.uploadLogo(logoFile);
        data.logoUrl = uploadedLogoUrl;
      }

      await configService.update(data);
      toast.success("Configurações salvas com sucesso");
      setTheme(data.theme);
    } catch (error) {
      toast.error("Erro ao salvar configurações");
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  const handleCnpjSearch = async () => {
    const cnpj = form.getValues("cnpj")?.replace(/\D/g, "");
    if (!cnpj || cnpj.length !== 14) {
      toast.error("Informe um CNPJ válido com 14 dígitos.");
      return;
    }

    setSearchingCnpj(true);
    try {
      const response = await api.get(`/settings/cnpj/${cnpj}`);
      const data = response.data;

      form.setValue("companyName", data.companyName);
      form.setValue("tradingName", data.tradingName);
      form.setValue("phone", data.phone);
      form.setValue("email", data.email);
      form.setValue("address", data.address);
      form.setValue("cnpj", data.cnpj);

      toast.success("Dados da empresa carregados!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar CNPJ. Verifique se está correto.");
    } finally {
      setSearchingCnpj(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle>Configurações da Aplicação</CardTitle>
        <CardDescription>
          Gerencie as informações gerais, visual e dados fiscais da sua empresa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Visual e Identidade</h3>
                <p className="text-sm text-muted-foreground">
                  Personalize o nome, logo e tema da sua aplicação.
                </p>
              </div>
              <Separator />

              <div className="flex flex-col md:flex-row gap-6">
                {/* Logo Upload Section */}
                <div className="flex flex-col gap-2">
                  <FormLabel>Logo da Aplicação</FormLabel>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-md border border-dashed flex items-center justify-center relative overflow-hidden bg-muted">
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt="Logo preview"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground opacity-50" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        className="w-full max-w-xs cursor-pointer text-sm"
                        onChange={handleFileChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Recomendado: PNG ou JPG, máx 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="appName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Aplicação</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Meu PDV" {...field} />
                        </FormControl>
                        <FormDescription>
                          Nome exibido no topo da página e relatórios.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moeda</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a moeda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BRL">
                            Real Brasileiro (BRL)
                          </SelectItem>
                          <SelectItem value="USD">
                            Dólar Americano (USD)
                          </SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tema Padrão</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tema" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="system">Sistema</SelectItem>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">
                  Dados da Empresa (Fiscal)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Informações utilizadas na impressão de comprovantes.
                </p>
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCnpjSearch}
                    disabled={searchingCnpj}
                    title="Buscar dados do CNPJ"
                  >
                    {searchingCnpj ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="stateRegistration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inscrição Estadual</FormLabel>
                      <FormControl>
                        <Input placeholder="Isento ou Nº" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(99) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da Empresa Ltda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tradingName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome na Fachada" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="contato@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço Completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua, Nº, Bairro, Cidade - UF"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
