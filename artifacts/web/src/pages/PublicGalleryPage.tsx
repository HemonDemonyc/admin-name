import { useState } from "react";
import { useRoute } from "wouter";
import { useGetPublicGallery, useLikeGalleryItem, useAddGalleryComment, getGetPublicGalleryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Comment = { id: string; author: string; text: string; timestamp: string };
type GalleryItem = { id: string; objectPath: string; type: "photo" | "video"; title?: string | null; caption?: string | null; order: number; likes: number; comments: Comment[] };

export default function PublicGalleryPage() {
  const [, params] = useRoute("/p/:username/gallery");
  const username = params?.username ?? "";
  const queryClient = useQueryClient();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");

  const { data: gallery, isLoading } = useGetPublicGallery(username, {
    query: { queryKey: getGetPublicGalleryQueryKey(username), enabled: !!username },
  });

  const likeItem = useLikeGalleryItem({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPublicGalleryQueryKey(username) }) },
  });

  const addComment = useAddGalleryComment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPublicGalleryQueryKey(username) });
        setCommentText(""); setCommentAuthor("");
      },
    },
  });

  const items: GalleryItem[] = [...((gallery?.items as GalleryItem[]) ?? [])].sort((a, b) => a.order - b.order);

  function prev() { if (lightbox !== null) setLightbox((lightbox - 1 + items.length) % items.length); }
  function next() { if (lightbox !== null) setLightbox((lightbox + 1) % items.length); }

  const currentItem = lightbox !== null ? items[lightbox] : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 py-5 border-b border-white/10">
        <h1 className="text-xl font-bold">{gallery?.title ?? "Galeria"}</h1>
        {gallery?.description && <p className="text-white/50 text-sm mt-1">{gallery.description}</p>}
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-white/40">Nenhum item na galeria ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5 p-0.5">
          {items.map((item, i) => (
            <div key={item.id} className="relative group">
              <button onClick={() => { setLightbox(i); setShowComments(null); }}
                className="relative w-full aspect-square overflow-hidden bg-white/5 hover:opacity-90 transition-opacity block">
                {item.type === "photo" ? (
                  <img src={`/api/storage${item.objectPath}`} alt={item.title ?? item.caption ?? ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">▶</div>
                  </div>
                )}
                {(item.title || item.caption) && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.title && <p className="text-xs font-semibold">{item.title}</p>}
                    {item.caption && <p className="text-xs text-white/60">{item.caption}</p>}
                  </div>
                )}
              </button>
              {/* Likes & comments bar */}
              <div className="flex items-center gap-3 px-2 py-1.5 bg-zinc-900">
                <button
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-red-400 transition-colors"
                  onClick={() => likeItem.mutate({ username, itemId: item.id })}
                >
                  <Heart className="w-3.5 h-3.5" />
                  {item.likes ?? 0}
                </button>
                <button
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-blue-400 transition-colors"
                  onClick={() => setShowComments(showComments === item.id ? null : item.id)}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {(item.comments ?? []).length}
                </button>
              </div>
              {showComments === item.id && (
                <div className="bg-zinc-900 border-t border-white/10 px-3 pb-3 space-y-2">
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pt-2">
                    {(item.comments ?? []).map((c) => (
                      <div key={c.id} className="text-xs">
                        <span className="font-semibold text-white/80">{c.author}: </span>
                        <span className="text-white/60">{c.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <Input value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="Nome" className="bg-white/10 border-white/20 text-white text-xs h-7 w-24 flex-shrink-0" />
                    <Input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Comentário..." className="bg-white/10 border-white/20 text-white text-xs h-7 flex-1"
                      onKeyDown={(e) => { if (e.key === "Enter" && commentText.trim()) addComment.mutate({ username, itemId: item.id, data: { author: commentAuthor || "Anônimo", text: commentText } }); }} />
                    <button
                      disabled={!commentText.trim() || addComment.isPending}
                      onClick={() => addComment.mutate({ username, itemId: item.id, data: { author: commentAuthor || "Anônimo", text: commentText } })}
                      className="text-white/60 hover:text-white disabled:opacity-30 transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && currentItem && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col" onClick={() => setLightbox(null)}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
            <div>
              {currentItem.title && <p className="font-semibold text-sm">{currentItem.title}</p>}
              {currentItem.caption && <p className="text-white/50 text-xs">{currentItem.caption}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-1 text-sm text-white/60 hover:text-red-400 transition-colors"
                onClick={() => likeItem.mutate({ username, itemId: currentItem.id })}
              >
                <Heart className="w-4 h-4" /> {currentItem.likes ?? 0}
              </button>
              <button className="text-white/60 hover:text-white" onClick={() => setLightbox(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative" onClick={() => setLightbox(null)}>
            {items.length > 1 && (
              <>
                <button className="absolute left-4 text-white/60 hover:text-white p-2 z-10" onClick={(e) => { e.stopPropagation(); prev(); }}>
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button className="absolute right-4 text-white/60 hover:text-white p-2 z-10" onClick={(e) => { e.stopPropagation(); next(); }}>
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
            <div className="max-w-3xl max-h-[70vh] p-4" onClick={(e) => e.stopPropagation()}>
              {currentItem.type === "photo" ? (
                <img src={`/api/storage${currentItem.objectPath}`} alt="" className="max-w-full max-h-[70vh] rounded-xl object-contain" />
              ) : (
                <video src={`/api/storage${currentItem.objectPath}`} controls autoPlay className="max-w-full max-h-[70vh] rounded-xl" />
              )}
            </div>
          </div>
          <div className="px-4 py-3 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-white/30 text-xs mb-3">{lightbox + 1} / {items.length}</p>
            <div className="max-w-xl mx-auto space-y-2">
              <div className="max-h-24 overflow-y-auto space-y-1">
                {(currentItem.comments ?? []).map((c) => (
                  <div key={c.id} className="text-xs">
                    <span className="font-semibold text-white/70">{c.author}: </span>
                    <span className="text-white/50">{c.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Nome" className="bg-white/10 border-white/20 text-white text-sm h-8 w-28 flex-shrink-0" />
                <Input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Adicionar comentário..." className="bg-white/10 border-white/20 text-white text-sm h-8 flex-1"
                  onKeyDown={(e) => { if (e.key === "Enter" && commentText.trim()) addComment.mutate({ username, itemId: currentItem.id, data: { author: commentAuthor || "Anônimo", text: commentText } }); }} />
                <Button size="sm" className="h-8 px-3" disabled={!commentText.trim() || addComment.isPending}
                  onClick={() => addComment.mutate({ username, itemId: currentItem.id, data: { author: commentAuthor || "Anônimo", text: commentText } })}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
