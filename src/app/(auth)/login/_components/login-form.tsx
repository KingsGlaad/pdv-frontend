"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";

const loginFormSchema = z.object({
  email: z.string().email("E-mail inválido.").min(1, "E-mail é obrigatório."),
  password: z.string().min(1, "Senha é obrigatória."),
});

type LoginFormInputs = z.infer<typeof loginFormSchema>;

export function LoginForm() {
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
    return <div>Carregando...</div>;
  }

  async function onSubmit(data: LoginFormInputs) {
    setBackendError(null); // Clear previous backend errors
    try {
      await signin(data.email, data.password);
      router.push("/dashboard");
    } catch (error: any) {
      // Handle backend errors
      if (error.message) {
        setBackendError(error.message);
      } else {
        setBackendError("Ocorreu um erro inesperado. Tente novamente.");
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-96 space-y-4 border p-6 rounded-lg"
    >
      <h1 className="text-xl font-semibold">Login</h1>

      <Input placeholder="Email" {...register("email")} />
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message}</p>
      )}

      <Input type="password" placeholder="Senha" {...register("password")} />
      {errors.password && (
        <p className="text-red-500 text-sm">{errors.password.message}</p>
      )}

      {backendError && <p className="text-red-500 text-sm">{backendError}</p>}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        Entrar
      </Button>
    </form>
  );
}
