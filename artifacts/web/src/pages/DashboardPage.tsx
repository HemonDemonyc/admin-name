import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Layout, Image, ExternalLink, LogOut } from "lucide-react";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: meData, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });

  const logout = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/login");
      },
    },
  });

  useEffect(() => {
    if (!isLoading && meData && !meData.user) {
      setLocation("/login");
    }
  }, [isLoading, meData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const user = meData?.user;
  if (!user) return null;

  const pageUrl = `/p/${user.username}`;
  const galleryUrl = `/p/${user.username}/gallery`;

  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      <header className="border-b border-sidebar-border px-6 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <div>
          <span className="font-serif font-bold text-sidebar-foreground">AppPage</span>
          <span className="text-sidebar-foreground/40 text-sm ml-3">Olá, {user.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-sidebar-foreground/50 hover:text-sidebar-foreground"
          onClick={() => logout.mutate({})}
          disabled={logout.isPending}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-sidebar-foreground">Dashboard</h1>
          <p className="text-sidebar-foreground/50 mt-1 text-sm">
            Gerencie o conteúdo das suas páginas públicas
          </p>
        </div>

        {/* Page link */}
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-sidebar-foreground/40 mb-1">Sua página pública</p>
            <p className="text-sm font-medium text-primary">{pageUrl}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-sidebar-border text-sidebar-foreground/70"
              onClick={() => window.open(pageUrl, "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setLocation("/dashboard/landing")}
            className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 hover:border-primary/50 hover:bg-sidebar-accent transition-all p-6 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
              <Layout className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-sidebar-foreground mb-1">Landing Page</h2>
            <p className="text-sm text-sidebar-foreground/50">
              Título, descrição, app, vídeo, fotos, redes sociais e template visual.
            </p>
            <span className="text-xs text-primary mt-3 block font-medium">Editar →</span>
          </button>

          <button
            onClick={() => setLocation("/dashboard/gallery")}
            className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 hover:border-primary/50 hover:bg-sidebar-accent transition-all p-6 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
              <Image className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-sidebar-foreground mb-1">Galeria Interna</h2>
            <p className="text-sm text-sidebar-foreground/50">
              Álbum privado de fotos e vídeos acessível só pelo app.
            </p>
            <span className="text-xs text-primary mt-3 block font-medium">Editar →</span>
          </button>
        </div>

        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/30 p-4">
          <p className="text-xs text-sidebar-foreground/40 mb-1">Link da galeria interna</p>
          <p className="text-sm font-medium text-sidebar-foreground/60">{galleryUrl}</p>
          <p className="text-xs text-sidebar-foreground/30 mt-1">Coloque este link dentro do seu app</p>
        </div>
      </main>
    </div>
  );
}
