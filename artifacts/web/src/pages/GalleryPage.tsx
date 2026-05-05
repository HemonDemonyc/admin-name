import { useState } from "react";
import { useGetGallery } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

export default function GalleryPage() {
  const { data: gallery, isLoading } = useGetGallery();
  const [selected, setSelected] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="grid grid-cols-3 gap-1 w-full max-w-3xl p-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  if (!gallery) return null;

  const sortedItems = [...(gallery.items ?? [])].sort((a, b) => a.order - b.order);
  const selectedItem = sortedItems.find((i) => i.id === selected);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="px-6 pt-10 pb-6">
        {gallery.title && (
          <h1 className="text-2xl font-bold text-white">{gallery.title}</h1>
        )}
        {gallery.description && (
          <p className="text-sm text-white/60 mt-1">{gallery.description}</p>
        )}
      </div>

      {/* Grid */}
      {sortedItems.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-white/40 text-sm">
          Nenhum item na galeria ainda.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 px-1">
          {sortedItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className="relative aspect-square overflow-hidden bg-white/5 hover:opacity-90 transition-opacity"
              data-testid={`gallery-item-${item.id}`}
            >
              {item.type === "photo" ? (
                <img
                  src={`/api/storage${item.objectPath}`}
                  alt={item.caption ?? ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={`/api/storage${item.objectPath}`}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              )}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            data-testid="button-close-lightbox"
          >
            <X className="w-7 h-7" />
          </button>
          <div
            className="max-w-3xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.type === "photo" ? (
              <img
                src={`/api/storage${selectedItem.objectPath}`}
                alt={selectedItem.caption ?? ""}
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={`/api/storage${selectedItem.objectPath}`}
                controls
                autoPlay
                className="w-full max-h-[80vh] rounded-lg"
              />
            )}
            {selectedItem.caption && (
              <p className="text-white/60 text-sm text-center mt-4">
                {selectedItem.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
