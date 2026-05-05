import { useLocation } from "wouter";
import { useAdminLogout, useGetAuthMe, getGetAuthMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayoutTemplate, Images, LogOut, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: authData } = useGetAuthMe({
    query: { queryKey: getGetAuthMeQueryKey() },
  });

  const logout = useAdminLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
        setLocation("/admin");
      },
    },
  });

  if (authData && !authData.authenticated) {
    setLocation("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      <header className="border-b border-sidebar-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">Painel Admin</h1>
          <p className="text-xs text-sidebar-foreground/50">Gerencie seu conteudo</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout.mutate({})}
          className="text-sidebar-foreground/60 hover:text-sidebar-foreground gap-2"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-4">
        <h2 className="text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-6">
          O que deseja editar?
        </h2>

        <button
          onClick={() => setLocation("/admin/landing")}
          className="w-full text-left"
          data-testid="button-edit-landing"
        >
          <Card className="bg-sidebar-accent border-sidebar-border hover:border-sidebar-primary transition-colors cursor-pointer group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <LayoutTemplate className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sidebar-foreground text-base">Landing Page</CardTitle>
                    <CardDescription className="text-sidebar-foreground/50 text-sm">
                      Titulo, descricao, app, video, fotos, redes sociais
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-sidebar-foreground/30 group-hover:text-primary transition-colors mt-1" />
              </div>
            </CardHeader>
          </Card>
        </button>

        <button
          onClick={() => setLocation("/admin/gallery")}
          className="w-full text-left"
          data-testid="button-edit-gallery"
        >
          <Card className="bg-sidebar-accent border-sidebar-border hover:border-sidebar-primary transition-colors cursor-pointer group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Images className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sidebar-foreground text-base">Galeria Interna</CardTitle>
                    <CardDescription className="text-sidebar-foreground/50 text-sm">
                      Album de fotos e videos exclusivo do aplicativo
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-sidebar-foreground/30 group-hover:text-primary transition-colors mt-1" />
              </div>
            </CardHeader>
          </Card>
        </button>
      </main>
    </div>
  );
}
