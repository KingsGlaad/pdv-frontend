import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <div className="h-screen flex items-center justify-center p-6 md:p-10">
      <LoginForm className="w-full max-w-sm md:max-w-3xl" />
    </div>
  );
}
