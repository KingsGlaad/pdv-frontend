"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import Image from "next/image";
import loginImage from "@/assets/fundo-login.png";
import { toast } from "sonner";

const loginFormSchema = z.object({
  email: z.email("E-mail inválido.").min(1, "E-mail é obrigatório."),
  password: z.string().min(1, "Senha é obrigatória."),
});

type LoginFormInputs = z.infer<typeof loginFormSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signin, isLogged, loading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginFormSchema),
  });

  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    if (isLogged) {
      router.push("/dashboard");
    }
  }, [isLogged, router]);

  if (loading || isLogged) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin w-12 h-12" />
      </div>
    );
  }

  async function onSubmit(data: LoginFormInputs) {
    setBackendError(null); // Clear previous backend errors
    try {
      await signin(data.email, data.password);
      router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setBackendError(error.message);
        toast.error(error.message);
      } else {
        setBackendError("Ocorreu um erro inesperado. Tente novamente.");
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Bem-vindo(a) de volta</h1>
                <p className="text-muted-foreground text-balance">
                  Digite seu e-mail e senha para acessar sua conta.
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email:</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
                {errors.email && toast.error(errors.email.message)}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Senha:</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register("password")}
                />
                {errors.password && toast.error(errors.password.message)}
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative h-64 md:h-auto">
            <Image
              src={loginImage}
              alt="Fundo Login"
              className="absolute inset-0 h-full w-full object-cover brightness-[0.7]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
