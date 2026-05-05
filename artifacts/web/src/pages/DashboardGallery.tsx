import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import {
  useGetMyGallery, useUpdateMyGallery, useGetMe, useRequestUploadUrl,
  getGetMyGalleryQueryKey, getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Loader2, Check, Film, ImageIcon, Heart, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

type Comment = { id: string; author: string; text: string; timestamp: string };
type GalleryItem = {
  id: string; objectPath: string; type: "photo" | "video";
  title?: string | null; caption?: string | null; order: number;
  likes: number; comments: Comment[];
};

const S = "bg-sidebar-accent border-sidebar-border text-sidebar-foreground text-sm";

function ItemEditor({ item, onChange, onDelete }: { item: GalleryItem; onChange: (item: GalleryItem) => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  function addComment() {
    if (!newCommentText.trim()) return;
    const comment: Comment = { id: uuidv4(), author: newCommentAuthor || "Admin", text: newCommentText, timestamp: new Date().toISOString() };
    onChange({ ...item, comments: [...(item.comments ?? []), comment] });
    setNewCommentText(""); setNewCommentAuthor("");
  }

  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 overflow-hidden">
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-sidebar flex-shrink-0">
          {item.type === "photo" ? (
            <img src={`/api/storage${item.objectPath}`} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-7 h-7 text-sidebar-foreground/30" />
            </div>
          )}
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-2 min-w-0">
          <Input value={item.title ?? ""} onChange={(e) => onChange({ ...item, title: e.target.value || null })}
            placeholder="Título do item" className={`${S} text-sm`} />
          <Input value={item.caption ?? ""} onChange={(e) => onChange({ ...item, caption: e.target.value || null })}
            placeholder="Legenda (opcional)" className={`${S} text-xs`} />
          <div className="flex items-center gap-3 text-xs text-sidebar-foreground/50">
            <button className="flex items-center gap-1 hover:text-sidebar-primary transition-colors"
              onClick={() => onChange({ ...item, likes: (item.likes ?? 0) + 1 })}>
              <Heart className="w-3.5 h-3.5" fill={(item.likes ?? 0) > 0 ? "currentColor" : "none"} />
              {item.likes ?? 0} curtidas
            </button>
            <button className="flex items-center gap-1 hover:text-sidebar-primary transition-colors" onClick={() => setExpanded(!expanded)}>
              <MessageCircle className="w-3.5 h-3.5" />
              {(item.comments ?? []).length} comentários
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <div className="ml-auto">
              <Button variant="ghost" size="icon" onClick={onDelete} className="h-6 w-6 text-sidebar-foreground/30 hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments panel */}
      {expanded && (
        <div className="border-t border-sidebar-border p-3 space-y-3">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {(item.comments ?? []).length === 0 && (
              <p className="text-xs text-sidebar-foreground/30 text-center py-2">Nenhum comentário ainda</p>
            )}
            {(item.comments ?? []).map((c) => (
              <div key={c.id} className="flex items-start gap-2 group">
                <div className="flex-1 bg-sidebar-accent rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-sidebar-foreground/80">{c.author}</span>
                    <span className="text-xs text-sidebar-foreground/30">{new Date(c.timestamp).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="text-xs text-sidebar-foreground/70">{c.text}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-sidebar-foreground/30 hover:text-destructive flex-shrink-0"
                  onClick={() => onChange({ ...item, comments: item.comments.filter((cm) => cm.id !== c.id) })}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input value={newCommentAuthor} onChange={(e) => setNewCommentAuthor(e.target.value)}
                placeholder="Autor" className={`${S} flex-1`} />
            </div>
            <div className="flex gap-2">
              <Input value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Escreva um comentário..." className={`${S} flex-1`}
                onKeyDown={(e) => { if (e.key === "Enter") addComment(); }} />
              <Button size="sm" onClick={addComment} disabled={!newCommentText.trim()}>Enviar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardGallery() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: meData } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: gallery, isLoading } = useGetMyGallery({ query: { queryKey: getGetMyGalleryQueryKey() } });

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDesc, setGalleryDesc] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [uploading, setUploading] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const requestUploadUrl = useRequestUploadUrl();
  const updateGallery = useUpdateMyGallery({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMyGalleryQueryKey() }); toast({ title: "Galeria salva!" }); },
      onError: () => toast({ title: "Erro ao salvar", variant: "destructive" }),
    },
  });

  useEffect(() => { if (meData && !meData.user) setLocation("/login"); }, [meData]);

  if (gallery && !initialized) {
    setItems((gallery.items as GalleryItem[]) ?? []);
    setGalleryTitle(gallery.title ?? "");
    setGalleryDesc(gallery.description ?? "");
    setInitialized(true);
  }

  async function uploadFile(file: File, type: "photo" | "video") {
    setUploading(true);
    try {
      const res = await new Promise<{ uploadURL: string; objectPath: string }>((resolve, reject) => {
        requestUploadUrl.mutate({ data: { name: file.name, size: file.size, contentType: file.type } }, { onSuccess: resolve, onError: reject });
      });
      await fetch(res.uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setItems((prev) => [...prev, { id: uuidv4(), objectPath: res.objectPath, type, title: null, caption: null, order: prev.length, likes: 0, comments: [] }]);
    } catch { toast({ title: "Erro no upload", variant: "destructive" }); }
    finally { setUploading(false); }
  }

  function handleSave() {
    updateGallery.mutate({ data: { title: galleryTitle || null, description: galleryDesc || null, items } });
  }

  if (isLoading) return <div className="min-h-screen bg-sidebar flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-sidebar-primary" /></div>;

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
        {/* Gallery meta */}
        <div className="space-y-3">
          <div>
            <Label className="text-sidebar-foreground/60 text-xs">Título da Galeria</Label>
            <Input value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} placeholder="Galeria" className={`mt-1 ${S}`} />
          </div>
          <div>
            <Label className="text-sidebar-foreground/60 text-xs">Descrição</Label>
            <Input value={galleryDesc} onChange={(e) => setGalleryDesc(e.target.value)} placeholder="Descrição opcional..." className={`mt-1 ${S}`} />
          </div>
        </div>

        {/* Upload buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 flex-1 border-sidebar-border text-sidebar-foreground/70" onClick={() => photoRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            Adicionar Fotos
          </Button>
          <Button variant="outline" className="gap-2 flex-1 border-sidebar-border text-sidebar-foreground/70" onClick={() => videoRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            Adicionar Vídeos
          </Button>
          <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { Array.from(e.target.files ?? []).forEach((f) => uploadFile(f, "photo")); }} />
          <input ref={videoRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => { Array.from(e.target.files ?? []).forEach((f) => uploadFile(f, "video")); }} />
        </div>

        {/* Stats bar */}
        {items.length > 0 && (
          <div className="flex gap-4 text-xs text-sidebar-foreground/40">
            <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> {items.filter(i => i.type === "photo").length} fotos</span>
            <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5" /> {items.filter(i => i.type === "video").length} vídeos</span>
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {items.reduce((a, i) => a + (i.likes ?? 0), 0)} curtidas total</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {items.reduce((a, i) => a + (i.comments?.length ?? 0), 0)} comentários total</span>
          </div>
        )}

        {/* Items */}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sidebar-border bg-sidebar-accent/30 p-16 text-center">
            <ImageIcon className="w-10 h-10 text-sidebar-foreground/20 mx-auto mb-3" />
            <p className="text-sidebar-foreground/40 text-sm">Nenhum item ainda. Adicione fotos ou vídeos acima.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <ItemEditor
                key={item.id}
                item={item}
                onChange={(updated) => { const u = [...items]; u[i] = updated; setItems(u); }}
                onDelete={() => setItems(items.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        )}

        {items.length > 0 && (
          <Button className="w-full" onClick={handleSave} disabled={updateGallery.isPending}>
            {updateGallery.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar Galeria ({items.length} {items.length === 1 ? "item" : "itens"})
          </Button>
        )}
      </div>
    </div>
  );
}
