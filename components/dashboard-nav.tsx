"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Calculator, 
  BookOpen, 
  FileText,
   BarChart3, 
   LogOut, 
   User, 
   Cog} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";

const menuItems = [
  {href:"/dashboard/", label: "Início", icon: Calculator },
  { href: "/dashboard/plano-contas", label: "Plano de Contas", icon: BookOpen },
  { href: "/dashboard/lancamentos", label: "Lançamentos", icon: FileText },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
  {href: "/dashboard/configuracoes",label: "Configurações", icon: Cog},
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession() || {};

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.replace("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-blue backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div>
              <div className="font-bold text-lg bg-gradient-to-r from-emerald-700 to-amber-600 bg-clip-text text-transparent">
                Xeque-Mate
              </div>
              <div className="text-xs text-muted-foreground">Sistema Contabilístico</div>
            </div>
          </Link>

          {/* Menu Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "space-x-2",
                      isActive && "bg-emerald-600 hover:bg-emerald-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{session?.user?.name || "Usuário"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden pb-3 flex space-x-1 overflow-x-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "space-x-2 whitespace-nowrap",
                    isActive && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
