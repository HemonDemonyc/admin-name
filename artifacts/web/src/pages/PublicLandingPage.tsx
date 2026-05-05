import { useRoute } from "wouter";
import { useGetPublicLanding, getGetPublicLandingQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Play, ExternalLink } from "lucide-react";
import { getTheme } from "@/lib/templates";
import {
  SiInstagram, SiYoutube, SiTiktok, SiWhatsapp, SiFacebook,
  SiTelegram, SiX, SiGithub,
} from "react-icons/si";

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram, youtube: SiYoutube, tiktok: SiTiktok,
  whatsapp: SiWhatsapp, facebook: SiFacebook, telegram: SiTelegram,
  twitter: SiX, x: SiX, github: SiGithub,
};

function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const Icon = SOCIAL_ICONS[platform.toLowerCase()] ?? ExternalLink;
  return <Icon className={className} />;
}

export default function PublicLandingPage() {
  const [, params] = useRoute("/p/:username");
  const username = params?.username ?? "";

  const { data: landing, isLoading, isError } = useGetPublicLanding(username, {
    query: { queryKey: getGetPublicLandingQueryKey(username), enabled: !!username },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8">
        <Skeleton className="h-48 w-full max-w-lg" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }

  if (isError || !landing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">404</p>
          <p className="text-muted-foreground">Página não encontrada</p>
        </div>
      </div>
    );
  }

  const theme = getTheme(landing.template ?? "vivid");
  const appServeUrl = landing.appFileObjectPath ? `/api/storage${landing.appFileObjectPath}` : null;
  const videoSrc = landing.tutorialVideoObjectPath
    ? `/api/storage${landing.tutorialVideoObjectPath}`
    : landing.tutorialVideoUrl ?? null;

  return (
    <div className={`min-h-screen ${theme.root}`}>
      {/* Hero */}
      <section className={`${theme.hero} px-6 pt-20 pb-24 text-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-3xl mx-auto">
          <h1 className={`font-serif text-5xl sm:text-6xl font-extrabold tracking-tight ${theme.heroText} mb-4`}>
            {landing.title}
          </h1>
          {landing.subtitle && (
            <p className={`text-xl font-medium ${theme.heroSubtext} mb-5`}>{landing.subtitle}</p>
          )}
          {landing.description && (
            <p className={`text-base ${theme.heroSubtext} max-w-xl mx-auto mb-10 leading-relaxed opacity-90`}>
              {landing.description}
            </p>
          )}
          {appServeUrl && (
            <a href={appServeUrl} download>
              <button className={`inline-flex items-center gap-2 ${theme.buttonBg} font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-base`}>
                <Download className="w-5 h-5" />
                {landing.buttonText ?? "Baixar Aplicativo"}
              </button>
            </a>
          )}
        </div>
      </section>

      {/* Tutorial Video */}
      {videoSrc && (
        <section className={`py-16 px-6 ${theme.sectionBg}`}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Play className={`w-5 h-5 ${theme.accent}`} />
              <h2 className="text-2xl font-bold">Tutorial de Instalação</h2>
            </div>
            {landing.tutorialVideoObjectPath ? (
              <video src={videoSrc} controls className="w-full rounded-2xl shadow-lg aspect-video object-cover bg-black" />
            ) : (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src={videoSrc.replace("watch?v=", "embed/")}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Photo Gallery */}
      {landing.photos && landing.photos.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Galeria</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(landing.photos as any[]).map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-black/10 group">
                  <img
                    src={`/api/storage${photo.objectPath}`}
                    alt={photo.caption ?? `Foto ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Links */}
      {landing.socialLinks && landing.socialLinks.length > 0 && (
        <section className={`py-16 px-6 ${theme.sectionBg}`}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl font-bold mb-8">Nos siga</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {(landing.socialLinks as any[]).map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl ${theme.cardBg} hover:scale-105 transition-transform text-sm font-medium`}>
                  <SocialIcon platform={link.platform} className="w-4 h-4" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className={`py-8 px-6 text-center text-xs border-t ${theme.border} ${theme.footerBg} opacity-60`}>
        {landing.title} — Todos os direitos reservados
      </footer>
    </div>
  );
}
