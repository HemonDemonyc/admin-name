import { useState, useRef } from "react";
import { useLocation } from "wouter";
import {
  useGetGallery,
  useUpdateGallery,
  useGetAuthMe,
  useRequestUploadUrl,
  getGetGalleryQueryKey,
  getGetAuthMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

type GalleryItem = {
  id: string;
  objectPath: string;
  type: "photo" | "video";
  caption?: string | null;
  order: number;
};

export default function AdminGallery() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: auth } = useGetAuthMe({ query: { queryKey: getGetAuthMeQueryKey() } });
  const { data: gallery, isLoading } = useGetGallery({ query: { queryKey: getGetGalleryQueryKey() } });

  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const requestUploadUrl = useRequestUploadUrl();
  const updateGallery = useUpdateGallery({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetGalleryQueryKey() });
        toast({ title: "Galeria salva com sucesso!" });
      },
      onError: () => {
        toast({ title: "Erro ao salvar galeria", variant: "destructive" });
      },
    },
  });

  if (auth && !auth.authenticated) {
    setLocation("/admin");
    return null;
  }

  if (gallery && !initialized) {
    setGalleryTitle(gallery.title ?? "");
    setGalleryDescription(gallery.description ?? "");
    setItems(gallery.items ?? []);
    setInitialized(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      try {
        const uploadRes = await new Promise<{ uploadURL: string; objectPath: string }>((resolve, reject) => {
          requestUploadUrl.mutate(
            { data: { name: file.name, size: file.size, contentType: file.type } },
            { onSuccess: resolve, onError: reject }
          );
        });
        await fetch(uploadRes.uploadURL, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        const newItem: GalleryItem = {
          id: uuidv4(),
          objectPath: uploadRes.objectPath,
          type: isVideo ? "video" : "photo",
          caption: null,
          order: items.length,
        };
        setItems((prev) => [...prev, newItem]);
      } catch {
        toast({ title: `Erro ao fazer upload de ${file.name}`, variant: "destructive" });
      }
    }
    setUploading(false);
  }

  function updateCaption(id: string, caption: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, caption } : item)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id).map((item, i) => ({ ...item, order: i })));
  }

  function handleSave() {
    updateGallery.mutate({
      data: {
        title: galleryTitle || null,
        description: galleryDescription || null,
        items,
      },
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      <header className="border-b border-sidebar-border px-6 py-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/admin/dashboard")}
          className="text-sidebar-foreground/60 hover:text-sidebar-foreground gap-1"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <h1 className="text-base font-bold text-sidebar-foreground">Editar Galeria</h1>
        <Button
          size="sm"
          className="ml-auto"
          onClick={handleSave}
          disabled={updateGallery.isPending}
          data-testid="button-save-gallery"
        >
          {updateGallery.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
        </Button>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Gallery info */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider">Informacoes da Galeria</h2>
          <div>
            <Label className="text-sidebar-foreground/70">Titulo</Label>
            <Input
              value={galleryTitle}
              onChange={(e) => setGalleryTitle(e.target.value)}
              placeholder="Ex: Minha Galeria"
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              data-testid="input-gallery-title"
            />
          </div>
          <div>
            <Label className="text-sidebar-foreground/70">Descricao</Label>
            <Textarea
              value={galleryDescription}
              onChange={(e) => setGalleryDescription(e.target.value)}
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground resize-none"
              rows={2}
              data-testid="textarea-gallery-description"
            />
          </div>
        </section>

        {/* Upload */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider">Adicionar Midia</h2>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full rounded-xl border border-dashed border-sidebar-border bg-sidebar-accent p-8 flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors"
            data-testid="button-upload-gallery"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <Upload className="w-8 h-8 text-sidebar-foreground/30" />
            )}
            <p className="text-sm text-sidebar-foreground/50">
              {uploading ? "Enviando..." : "Clique para adicionar fotos ou videos"}
            </p>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </section>

        {/* Items grid */}
        {items.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Itens ({items.length})
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-sidebar-accent rounded-xl p-3" data-testid={`gallery-item-edit-${item.id}`}>
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                    {item.type === "photo" ? (
                      <img src={`/api/storage${item.objectPath}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <video src={`/api/storage${item.objectPath}`} className="w-full h-full object-cover" muted />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-sidebar-foreground/40 mb-1.5 capitalize">{item.type}</p>
                    <Input
                      value={item.caption ?? ""}
                      onChange={(e) => updateCaption(item.id, e.target.value)}
                      placeholder="Legenda (opcional)"
                      className="bg-sidebar border-sidebar-border text-sidebar-foreground text-sm h-8"
                      data-testid={`input-caption-${item.id}`}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-sidebar-foreground/30 hover:text-destructive flex-shrink-0"
                    data-testid={`button-remove-item-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={updateGallery.isPending}
          data-testid="button-save-gallery-bottom"
        >
          {updateGallery.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Salvar galeria
        </Button>
      </div>
    </div>
  );
}
