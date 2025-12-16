// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Obtém o token dos cookies
  const token = request.cookies.get("access_token")?.value;

  // Define as URLs de login e da home
  const signInUrl = new URL("/login", request.url);
  const homeUrl = new URL("/", request.url);

  // Verifica se o usuário está na página de login
  const isLoginPage = request.nextUrl.pathname === "/login";

  // Se não tiver token e não estiver na página de login, redireciona para o login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(signInUrl);
  }

  // Se tiver token e estiver na página de login, redireciona para a home (ou dashboard)
  if (token && isLoginPage) {
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

// Configura em quais rotas o middleware deve rodar
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
