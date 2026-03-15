import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Mapa: rota → permissão necessária
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/dashboard/contas": "contas.ver",
  "/dashboard/lancamentos": "lancamentos.ver",
  "/dashboard/periodos": "periodos.ver",
  "/dashboard/utilizadores": "utilizadores.ver",
  "/dashboard/relatorios": "relatorios.ver",
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    const permissions: string[] = (token?.permissions as string[]) ?? [];

    // Verificar se a rota requer uma permissão específica
    for (const [route, requiredPerm] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname.startsWith(route)) {
        if (!permissions.includes(requiredPerm)) {
          // Redirecionar para página de acesso negado
          return NextResponse.redirect(new URL("/dashboard/sem-acesso", req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Só precisa estar autenticado
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};