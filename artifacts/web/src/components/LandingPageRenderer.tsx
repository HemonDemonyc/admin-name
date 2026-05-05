import { Download, Play, ExternalLink } from "lucide-react";
import {
  SiInstagram, SiYoutube, SiTiktok, SiWhatsapp, SiFacebook,
  SiTelegram, SiX, SiGithub,
} from "react-icons/si";

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram, youtube: SiYoutube, tiktok: SiTiktok,
  whatsapp: SiWhatsapp, facebook: SiFacebook, telegram: SiTelegram,
  twitter: SiX, x: SiX, github: SiGithub,
};

export type LandingData = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  buttonText?: string | null;
  appFileObjectPath?: string | null;
  tutorialVideoObjectPath?: string | null;
  tutorialVideoUrl?: string | null;
  logoObjectPath?: string | null;
  heroGradientFrom?: string | null;
  heroGradientTo?: string | null;
  heroBgType?: string | null;
  heroBgColor?: string | null;
  heroBgImageObjectPath?: string | null;
  heroTextDark?: boolean | null;
  ctaBgColor?: string | null;
  ctaTextColor?: string | null;
  pageBgColor?: string | null;
  pageTextColor?: string | null;
  accentColor?: string | null;
  photos?: { objectPath: string; caption?: string | null }[];
  socialLinks?: { platform: string; url: string; label: string }[];
  sections?: { id: string; title: string; body: string; icon?: string | null }[];
};

function getHeroStyle(data: LandingData): React.CSSProperties {
  const type = data.heroBgType ?? "gradient";
  if (type === "image" && data.heroBgImageObjectPath) {
    return {
      backgroundImage: `url(/api/storage${data.heroBgImageObjectPath})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (type === "solid" && data.heroBgColor) {
    return { backgroundColor: data.heroBgColor };
  }
  const from = data.heroGradientFrom ?? "#7c3aed";
  const to = data.heroGradientTo ?? "#4338ca";
  return { backgroundImage: `linear-gradient(135deg, ${from}, ${to})` };
}

export default function LandingPageRenderer({ data, scaled = false }: { data: LandingData; scaled?: boolean }) {
  const heroStyle = getHeroStyle(data);
  const textDark = data.heroTextDark;
  const heroTextClass = textDark ? "text-gray-900" : "text-white";
  const heroSubtextClass = textDark ? "text-gray-700" : "text-white/80";
  const pageBg = data.pageBgColor ? { backgroundColor: data.pageBgColor } : {};
  const pageText = data.pageTextColor ? { color: data.pageTextColor } : {};
  const ctaStyle: React.CSSProperties = {};
  if (data.ctaBgColor) ctaStyle.backgroundColor = data.ctaBgColor;
  if (data.ctaTextColor) ctaStyle.color = data.ctaTextColor;

  const appServeUrl = data.appFileObjectPath ? `/api/storage${data.appFileObjectPath}` : null;
  const videoSrc = data.tutorialVideoObjectPath
    ? `/api/storage${data.tutorialVideoObjectPath}`
    : data.tutorialVideoUrl ?? null;
  const accentColor = data.accentColor ?? (data.heroGradientFrom ?? "#7c3aed");

  return (
    <div className={`min-h-screen font-sans antialiased`} style={{ ...pageBg, ...pageText }}>
      {/* Hero */}
      <section style={{ ...heroStyle, position: "relative", overflow: "hidden" }} className="px-6 pt-16 pb-20 text-center">
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.08)" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          {data.logoObjectPath && (
            <img src={`/api/storage${data.logoObjectPath}`} alt="Logo" className="h-14 w-auto mx-auto mb-6 object-contain" />
          )}
          <h1 className={`font-serif font-extrabold tracking-tight ${heroTextClass} mb-3`}
            style={{ fontSize: scaled ? "1.75rem" : "3.5rem", lineHeight: 1.1 }}>
            {data.title || "Meu App"}
          </h1>
          {data.subtitle && (
            <p className={`font-semibold ${heroSubtextClass} mb-3`}
              style={{ fontSize: scaled ? "0.85rem" : "1.2rem" }}>
              {data.subtitle}
            </p>
          )}
          {data.description && (
            <p className={`${heroSubtextClass} opacity-90 max-w-lg mx-auto mb-8 leading-relaxed`}
              style={{ fontSize: scaled ? "0.7rem" : "1rem" }}>
              {data.description}
            </p>
          )}
          {appServeUrl && (
            <a href={appServeUrl} download>
              <button
                className="inline-flex items-center gap-2 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                style={{ ...ctaStyle, padding: scaled ? "0.4rem 1rem" : "1rem 2rem", fontSize: scaled ? "0.75rem" : "1rem",
                  backgroundColor: ctaStyle.backgroundColor ?? "white",
                  color: ctaStyle.color ?? accentColor }}
              >
                <Download style={{ width: scaled ? "0.8rem" : "1.2rem", height: scaled ? "0.8rem" : "1.2rem" }} />
                {data.buttonText ?? "Baixar Aplicativo"}
              </button>
            </a>
          )}
        </div>
      </section>

      {/* Custom Sections */}
      {data.sections && data.sections.length > 0 && (
        <section className="py-12 px-6" style={pageBg}>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: data.sections.length > 1 ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>
            {data.sections.map((sec) => (
              <div key={sec.id} className="rounded-2xl border p-6" style={{ borderColor: "rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.6)" }}>
                {sec.icon && <div className="text-2xl mb-2">{sec.icon}</div>}
                <h3 className="font-bold mb-2" style={{ fontSize: scaled ? "0.75rem" : "1.1rem", color: accentColor }}>{sec.title}</h3>
                <p className="leading-relaxed" style={{ fontSize: scaled ? "0.65rem" : "0.9rem", opacity: 0.75 }}>{sec.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video */}
      {videoSrc && !scaled && (
        <section className="py-14 px-6">
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div className="flex items-center gap-2 mb-5">
              <Play className="w-5 h-5" style={{ color: accentColor }} />
              <h2 className="text-2xl font-bold">Tutorial de Instalação</h2>
            </div>
            {data.tutorialVideoObjectPath ? (
              <video src={videoSrc} controls className="w-full rounded-2xl shadow-lg aspect-video bg-black" />
            ) : (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                <iframe src={videoSrc.replace("watch?v=", "embed/")} className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Photos */}
      {data.photos && data.photos.length > 0 && (
        <section className="py-12 px-6">
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 className="font-bold mb-6" style={{ fontSize: scaled ? "0.85rem" : "1.5rem" }}>Galeria</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: scaled ? "0.25rem" : "0.75rem" }}>
              {data.photos.map((photo, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl group" style={{ aspectRatio: "1/1", background: "rgba(0,0,0,0.08)" }}>
                  <img src={`/api/storage${photo.objectPath}`} alt={photo.caption ?? `Foto ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Links */}
      {data.socialLinks && data.socialLinks.length > 0 && (
        <section className="py-12 px-6 text-center">
          <h2 className="font-bold mb-6" style={{ fontSize: scaled ? "0.85rem" : "1.25rem" }}>Nos siga</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {data.socialLinks.map((link, i) => {
              const Icon = SOCIAL_ICONS[link.platform.toLowerCase()] ?? ExternalLink;
              return (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border font-medium hover:scale-105 transition-transform"
                  style={{ padding: scaled ? "0.3rem 0.75rem" : "0.75rem 1.25rem", fontSize: scaled ? "0.65rem" : "0.875rem",
                    borderColor: "rgba(0,0,0,0.12)", background: "rgba(255,255,255,0.7)" }}>
                  <Icon className={scaled ? "w-3 h-3" : "w-4 h-4"} />
                  {link.label}
                </a>
              );
            })}
          </div>
        </section>
      )}

      <footer className="py-6 px-6 text-center border-t" style={{ fontSize: scaled ? "0.6rem" : "0.75rem", opacity: 0.5, borderColor: "rgba(0,0,0,0.1)" }}>
        {data.title} — Todos os direitos reservados
      </footer>
    </div>
  );
}
