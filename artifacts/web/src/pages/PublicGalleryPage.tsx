import { useState } from "react";
import { useRoute } from "wouter";
import { useGetPublicGallery, getGetPublicGalleryQueryKey } from "@workspace/api-client-react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type GalleryItem = { id: string; objectPath: string; type: "photo" | "video"; caption?: string | null; order: number };

export default function PublicGalleryPage() {
  const [, params] = useRoute("/p/:username/gallery");
  const username = params?.username ?? "";
  const [lightbox, setLightbox] = useState<number | null>(null);

  const { data: gallery, isLoading } = useGetPublicGallery(username, {
    query: { queryKey: getGetPublicGalleryQueryKey(username), enabled: !!username },
  });

  const items: GalleryItem[] = (gallery?.items as GalleryItem[]) ?? [];
  const sorted = [...items].sort((a, b) => a.order - b.order);

  function prev() { if (lightbox !== null) setLightbox((lightbox - 1 + sorted.length) % sorted.length); }
  function next() { if (lightbox !== null) setLightbox((lightbox + 1) % sorted.length); }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 py-5 border-b border-white/10">
        <h1 className="text-xl font-bold">Galeria</h1>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-white/40">Nenhum item na galeria ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5 p-0.5">
          {sorted.map((item, i) => (
            <button key={item.id} onClick={() => setLightbox(i)}
              className="relative aspect-square overflow-hidden bg-white/5 group hover:opacity-90 transition-opacity">
              {item.type === "photo" ? (
                <img src={`/api/storage${item.objectPath}`} alt={item.caption ?? ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-2xl">▶</span>
                  </div>
                </div>
              )}
              {item.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-black/70 text-xs px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.caption}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2" onClick={() => setLightbox(null)}>
            <X className="w-6 h-6" />
          </button>
          {sorted.length > 1 && (
            <>
              <button className="absolute left-4 text-white/70 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); prev(); }}>
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button className="absolute right-4 text-white/70 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); next(); }}>
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          <div className="max-w-3xl max-h-[80vh] p-4" onClick={(e) => e.stopPropagation()}>
            {sorted[lightbox]?.type === "photo" ? (
              <img src={`/api/storage${sorted[lightbox].objectPath}`} alt="" className="max-w-full max-h-[80vh] rounded-xl object-contain" />
            ) : (
              <video src={`/api/storage${sorted[lightbox].objectPath}`} controls autoPlay className="max-w-full max-h-[80vh] rounded-xl" />
            )}
            {sorted[lightbox]?.caption && (
              <p className="text-center text-white/60 text-sm mt-3">{sorted[lightbox].caption}</p>
            )}
            <p className="text-center text-white/30 text-xs mt-2">{lightbox + 1} / {sorted.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
