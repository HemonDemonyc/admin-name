import { useGetLanding } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, Play, ExternalLink } from "lucide-react";
import {
  SiInstagram, SiYoutube, SiTiktok, SiWhatsapp, SiFacebook,
  SiTelegram, SiX, SiGithub,
} from "react-icons/si";

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram,
  youtube: SiYoutube,
  tiktok: SiTiktok,
  whatsapp: SiWhatsapp,
  facebook: SiFacebook,
  telegram: SiTelegram,
  twitter: SiX,
  x: SiX,
  github: SiGithub,
};

function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const Icon = SOCIAL_ICONS[platform.toLowerCase()] ?? ExternalLink;
  return <Icon className={className} />;
}

export default function LandingPage() {
  const { data: landing, isLoading } = useGetLanding();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-48 w-full max-w-2xl" />
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!landing) return null;

  const appServeUrl = landing.appFileObjectPath
    ? `/api/storage${landing.appFileObjectPath}`
    : null;

  const videoSrc = landing.tutorialVideoObjectPath
    ? `/api/storage${landing.tutorialVideoObjectPath}`
    : landing.tutorialVideoUrl ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20 pt-24 pb-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-4">
            {landing.title}
          </h1>
          {landing.subtitle && (
            <p className="text-xl text-muted-foreground font-medium mb-6">
              {landing.subtitle}
            </p>
          )}
          {landing.description && (
            <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              {landing.description}
            </p>
          )}
          {appServeUrl && (
            <a href={appServeUrl} download>
              <Button
                size="lg"
                data-testid="button-download-app"
                className="gap-2 text-base px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <Download className="w-5 h-5" />
                {landing.buttonText ?? "Baixar Aplicativo"}
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Tutorial Video */}
      {videoSrc && (
        <section className="py-16 px-6 bg-card/50">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Play className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Tutorial de Instalacao</h2>
            </div>
            {landing.tutorialVideoObjectPath ? (
              <video
                src={videoSrc}
                controls
                className="w-full rounded-2xl shadow-lg aspect-video object-cover bg-black"
                data-testid="video-tutorial"
              />
            ) : (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src={videoSrc.replace("watch?v=", "embed/")}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  data-testid="iframe-tutorial"
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
            <h2 className="text-2xl font-bold text-foreground mb-8">Galeria</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {landing.photos.map((photo, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
                  data-testid={`img-landing-photo-${i}`}
                >
                  <img
                    src={`/api/storage${photo.objectPath}`}
                    alt={photo.caption ?? `Foto ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
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
        <section className="py-16 px-6 bg-card/50 border-t border-border">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl font-bold text-foreground mb-8">Nos siga</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {landing.socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`link-social-${link.platform}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-background border border-border hover:border-primary hover:text-primary transition-colors text-sm font-medium"
                >
                  <SocialIcon platform={link.platform} className="w-4 h-4" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="py-8 px-6 text-center text-xs text-muted-foreground border-t border-border">
        {landing.title} — Todos os direitos reservados
      </footer>
    </div>
  );
}
