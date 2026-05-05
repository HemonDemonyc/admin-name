import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import {
  useGetMyGallery, useUpdateMyGallery, useGetMe, useRequestUploadUrl,
  getGetMyGalleryQueryKey, getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Loader2, Check, Film, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

type GalleryItem = { id: string; objectPath: string; type: "photo" | "video"; caption?: string | null; order: number };

export default function DashboardGallery() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: meData } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: gallery, isLoading } = useGetMyGallery({ query: { queryKey: getGetMyGalleryQueryKey() } });

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [uploading, setUploading] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const requestUploadUrl = useRequestUploadUrl();
  const updateGallery = useUpdateMyGallery({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyGalleryQueryKey() });
        toast({ title: "Galeria salva!" });
      },
      onError: () => toast({ title: "Erro ao salvar", variant: "destructive" }),
    },
  });

  useEffect(() => {
    if (meData && !meData.user) setLocation("/login");
  }, [meData]);

  if (gallery && !initialized) {
    setItems((gallery.items as GalleryItem[]) ?? []);
    setInitialized(true);
  }

  async function uploadFile(file: File, type: "photo" | "video") {
    setUploading(true);
    try {
      const res = await new Promise<{ uploadURL: string; objectPath: string }>((resolve, reject) => {
        requestUploadUrl.mutate(
          { data: { name: file.name, size: file.size, contentType: file.type } },
          { onSuccess: resolve, onError: reject },
        );
      });
      await fetch(res.uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setItems((prev) => [...prev, { id: uuidv4(), objectPath: res.objectPath, type, order: prev.length }]);
    } catch {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>, type: "photo" | "video") {
    for (const file of Array.from(e.target.files ?? [])) {
      await uploadFile(file, type);
    }
  }

  function handleSave() {
    updateGallery.mutate({ data: { items } });
  }

  if (isLoading) {
    return <div className="min-h-screen bg-sidebar flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      <header className="border-b border-sidebar-border px-6 py-4 flex items-center gap-3 sticky top-0 z-10 bg-sidebar">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="text-sidebar-foreground/60 hover:text-sidebar-foreground gap-1">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <h1 className="text-base font-bold">Galeria Interna</h1>
        <Button size="sm" className="ml-auto gap-2" onClick={handleSave} disabled={updateGallery.isPending}>
          {updateGallery.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Salvar
        </Button>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 flex-1 border-sidebar-border text-sidebar-foreground/70" onClick={() => photoRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            Adicionar Fotos
          </Button>
          <Button variant="outline" className="gap-2 flex-1 border-sidebar-border text-sidebar-foreground/70" onClick={() => videoRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            Adicionar Vídeos
          </Button>
          <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e, "photo")} />
          <input ref={videoRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => handleFiles(e, "video")} />
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sidebar-border bg-sidebar-accent/30 p-16 text-center">
            <ImageIcon className="w-10 h-10 text-sidebar-foreground/20 mx-auto mb-3" />
            <p className="text-sidebar-foreground/40 text-sm">Nenhum item ainda. Adicione fotos ou vídeos acima.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {items.map((item, i) => (
              <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-sidebar-accent group">
                {item.type === "photo" ? (
                  <img src={`/api/storage${item.objectPath}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-8 h-8 text-sidebar-foreground/40" />
                    <span className="absolute bottom-2 left-2 text-xs text-sidebar-foreground/60 bg-black/40 px-1.5 py-0.5 rounded">Vídeo</span>
                  </div>
                )}
                <button
                  onClick={() => setItems(items.filter((_, j) => j !== i))}
                  className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <Button className="w-full" onClick={handleSave} disabled={updateGallery.isPending}>
            {updateGallery.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar galeria ({items.length} {items.length === 1 ? "item" : "itens"})
          </Button>
        )}
      </div>
    </div>
  );
}
