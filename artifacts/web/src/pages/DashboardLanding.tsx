import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  useGetMyLanding, useUpdateMyLanding, useGetMe, useRequestUploadUrl,
  getGetMyLandingQueryKey, getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Upload, Loader2, Check, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import LandingPageRenderer, { type LandingData } from "@/components/LandingPageRenderer";

type SocialLink = { platform: string; url: string; label: string };
type LandingPhoto = { objectPath: string; caption?: string | null };
type Section = { id: string; title: string; body: string; icon?: string | null };

const PRESETS = [
  { id: "vivid", name: "Vivid", from: "#7c3aed", to: "#4338ca", cta: "#fff", ctaText: "#7c3aed", page: "#f5f3ff", text: "#1a0a3d" },
  { id: "dark", name: "Dark", from: "#18181b", to: "#27272a", cta: "#f4f4f5", ctaText: "#18181b", page: "#09090b", text: "#f4f4f5" },
  { id: "nature", name: "Nature", from: "#059669", to: "#0d9488", cta: "#fff", ctaText: "#059669", page: "#f0fdf4", text: "#052e16" },
  { id: "sunset", name: "Sunset", from: "#f97316", to: "#f43f5e", cta: "#fff", ctaText: "#f97316", page: "#fff7ed", text: "#3d0f00" },
  { id: "ocean", name: "Ocean", from: "#0ea5e9", to: "#6366f1", cta: "#fff", ctaText: "#0ea5e9", page: "#f0f9ff", text: "#0c1a2b" },
  { id: "rose", name: "Rose", from: "#e11d48", to: "#be185d", cta: "#fff", ctaText: "#e11d48", page: "#fff1f2", text: "#1a0a10" },
];

function AccordionSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-sidebar-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-sidebar-accent/60 hover:bg-sidebar-accent text-left transition-colors">
        <span className="text-sm font-semibold text-sidebar-foreground">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-sidebar-foreground/40" /> : <ChevronRight className="w-4 h-4 text-sidebar-foreground/40" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

const S = "bg-sidebar-accent border-sidebar-border text-sidebar-foreground text-sm";

export default function DashboardLanding() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: meData } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: landing, isLoading } = useGetMyLanding({ query: { queryKey: getGetMyLandingQueryKey() } });

  const [template, setTemplate] = useState("vivid");
  const [title, setTitle] = useState("Meu App");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState("");
  const [appFileObjectPath, setAppFileObjectPath] = useState<string | null>(null);
  const [tutorialVideoObjectPath, setTutorialVideoObjectPath] = useState<string | null>(null);
  const [logoObjectPath, setLogoObjectPath] = useState<string | null>(null);
  const [photos, setPhotos] = useState<LandingPhoto[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  // Colors
  const [heroGradientFrom, setHeroGradientFrom] = useState("#7c3aed");
  const [heroGradientTo, setHeroGradientTo] = useState("#4338ca");
  const [heroBgType, setHeroBgType] = useState<"gradient" | "solid" | "image">("gradient");
  const [heroBgColor, setHeroBgColor] = useState("#7c3aed");
  const [heroBgImageObjectPath, setHeroBgImageObjectPath] = useState<string | null>(null);
  const [heroTextDark, setHeroTextDark] = useState(false);
  const [ctaBgColor, setCtaBgColor] = useState("#ffffff");
  const [ctaTextColor, setCtaTextColor] = useState("#7c3aed");
  const [pageBgColor, setPageBgColor] = useState("#f5f3ff");
  const [pageTextColor, setPageTextColor] = useState("#1a0a3d");
  const [accentColor, setAccentColor] = useState("#7c3aed");

  const [initialized, setInitialized] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const appFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const photoFileRef = useRef<HTMLInputElement>(null);
  const bgImageRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const requestUploadUrl = useRequestUploadUrl();
  const updateLanding = useUpdateMyLanding({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyLandingQueryKey() });
        toast({ title: "Salvo!" });
        setSaving(false);
      },
      onError: () => { toast({ title: "Erro ao salvar", variant: "destructive" }); setSaving(false); },
    },
  });

  useEffect(() => {
    if (meData && !meData.user) setLocation("/login");
  }, [meData]);

  if (landing && !initialized) {
    setTemplate(landing.template ?? "vivid");
    setTitle(landing.title ?? "Meu App");
    setSubtitle(landing.subtitle ?? "");
    setDescription(landing.description ?? "");
    setButtonText(landing.buttonText ?? "");
    setTutorialVideoUrl(landing.tutorialVideoUrl ?? "");
    setAppFileObjectPath(landing.appFileObjectPath ?? null);
    setTutorialVideoObjectPath(landing.tutorialVideoObjectPath ?? null);
    setLogoObjectPath(landing.logoObjectPath ?? null);
    setPhotos((landing.photos as LandingPhoto[]) ?? []);
    setSocialLinks((landing.socialLinks as SocialLink[]) ?? []);
    setSections((landing.sections as Section[]) ?? []);
    setHeroGradientFrom(landing.heroGradientFrom ?? "#7c3aed");
    setHeroGradientTo(landing.heroGradientTo ?? "#4338ca");
    setHeroBgType((landing.heroBgType as any) ?? "gradient");
    setHeroBgColor(landing.heroBgColor ?? "#7c3aed");
    setHeroBgImageObjectPath(landing.heroBgImageObjectPath ?? null);
    setHeroTextDark(landing.heroTextDark ?? false);
    setCtaBgColor(landing.ctaBgColor ?? "#ffffff");
    setCtaTextColor(landing.ctaTextColor ?? "#7c3aed");
    setPageBgColor(landing.pageBgColor ?? "#f5f3ff");
    setPageTextColor(landing.pageTextColor ?? "#1a0a3d");
    setAccentColor(landing.accentColor ?? "#7c3aed");
    setInitialized(true);
  }

  const previewData: LandingData = {
    title, subtitle: subtitle || null, description: description || null,
    buttonText: buttonText || null,
    appFileObjectPath, tutorialVideoObjectPath, tutorialVideoUrl: tutorialVideoUrl || null,
    logoObjectPath,
    heroGradientFrom, heroGradientTo, heroBgType, heroBgColor, heroBgImageObjectPath,
    heroTextDark, ctaBgColor, ctaTextColor, pageBgColor, pageTextColor, accentColor,
    photos, socialLinks, sections,
  };

  function applyPreset(p: typeof PRESETS[0]) {
    setTemplate(p.id);
    setHeroGradientFrom(p.from);
    setHeroGradientTo(p.to);
    setHeroBgType("gradient");
    setCtaBgColor(p.cta);
    setCtaTextColor(p.ctaText);
    setPageBgColor(p.page);
    setPageTextColor(p.text);
    setAccentColor(p.from);
  }

  async function uploadFile(file: File, label: string): Promise<string | null> {
    setUploading(label);
    try {
      const res = await new Promise<{ uploadURL: string; objectPath: string }>((resolve, reject) => {
        requestUploadUrl.mutate({ data: { name: file.name, size: file.size, contentType: file.type } }, { onSuccess: resolve, onError: reject });
      });
      await fetch(res.uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      return res.objectPath;
    } catch {
      toast({ title: `Erro ao fazer upload de ${label}`, variant: "destructive" });
      return null;
    } finally { setUploading(null); }
  }

  function handleSave() {
    setSaving(true);
    updateLanding.mutate({
      data: {
        template, title,
        subtitle: subtitle || null, description: description || null,
        buttonText: buttonText || null, tutorialVideoUrl: tutorialVideoUrl || null,
        appFileObjectPath, tutorialVideoObjectPath, logoObjectPath,
        heroGradientFrom, heroGradientTo, heroBgType, heroBgColor, heroBgImageObjectPath,
        heroTextDark, ctaBgColor, ctaTextColor, pageBgColor, pageTextColor, accentColor,
        photos, socialLinks, sections,
      },
    });
  }

  if (isLoading) return <div className="min-h-screen bg-sidebar flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-sidebar-primary" /></div>;

  return (
    <div className="h-screen bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-sidebar-border px-4 py-3 flex items-center gap-3 flex-shrink-0 bg-sidebar z-10">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="text-sidebar-foreground/60 hover:text-sidebar-foreground gap-1">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <h1 className="text-sm font-bold text-sidebar-foreground">Editor da Landing Page</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving || !!uploading} className="gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Salvar
          </Button>
        </div>
      </header>

      {/* Split Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="w-[420px] flex-shrink-0 overflow-y-auto border-r border-sidebar-border p-4 space-y-3">

          {/* Design presets */}
          <AccordionSection title="🎨 Template & Cores" defaultOpen>
            <div>
              <Label className="text-sidebar-foreground/60 text-xs mb-2 block">Presets de Design</Label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PRESETS.map((p) => (
                  <button key={p.id} onClick={() => applyPreset(p)}
                    className={`rounded-xl overflow-hidden text-xs font-semibold transition-all ${template === p.id ? "ring-2 ring-sidebar-primary ring-offset-1 ring-offset-sidebar" : "opacity-60 hover:opacity-90"}`}>
                    <div className="h-10" style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }} />
                    <div className="py-1 text-center text-sidebar-foreground/70 bg-sidebar-accent">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sidebar-foreground/60 text-xs mb-2 block">Tipo de Fundo do Hero</Label>
              <div className="flex gap-2">
                {(["gradient", "solid", "image"] as const).map((t) => (
                  <button key={t} onClick={() => setHeroBgType(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${heroBgType === t ? "bg-sidebar-primary text-white" : "bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground"}`}>
                    {t === "gradient" ? "Gradiente" : t === "solid" ? "Sólido" : "Imagem"}
                  </button>
                ))}
              </div>
            </div>
            {heroBgType === "gradient" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sidebar-foreground/60 text-xs">Cor 1</Label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={heroGradientFrom} onChange={(e) => setHeroGradientFrom(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0" />
                    <Input value={heroGradientFrom} onChange={(e) => setHeroGradientFrom(e.target.value)} className={`${S} flex-1`} />
                  </div>
                </div>
                <div>
                  <Label className="text-sidebar-foreground/60 text-xs">Cor 2</Label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={heroGradientTo} onChange={(e) => setHeroGradientTo(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0" />
                    <Input value={heroGradientTo} onChange={(e) => setHeroGradientTo(e.target.value)} className={`${S} flex-1`} />
                  </div>
                </div>
              </div>
            )}
            {heroBgType === "solid" && (
              <div>
                <Label className="text-sidebar-foreground/60 text-xs">Cor de Fundo Hero</Label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={heroBgColor} onChange={(e) => setHeroBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={heroBgColor} onChange={(e) => setHeroBgColor(e.target.value)} className={`${S} flex-1`} />
                </div>
              </div>
            )}
            {heroBgType === "image" && (
              <div>
                <Label className="text-sidebar-foreground/60 text-xs">Imagem de Fundo (Wallpaper)</Label>
                {heroBgImageObjectPath ? (
                  <div className="flex items-center gap-2 mt-1">
                    <img src={`/api/storage${heroBgImageObjectPath}`} className="w-12 h-8 rounded object-cover" alt="" />
                    <Button variant="outline" size="sm" onClick={() => setHeroBgImageObjectPath(null)} className="border-sidebar-border text-sidebar-foreground/60 text-xs">Remover</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="mt-1 w-full border-sidebar-border text-sidebar-foreground/60"
                    onClick={() => bgImageRef.current?.click()} disabled={uploading === "bgimage"}>
                    {uploading === "bgimage" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                    Escolher imagem
                  </Button>
                )}
                <input ref={bgImageRef} type="file" accept="image/*" className="hidden"
                  onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const p = await uploadFile(f, "bgimage"); if (p) setHeroBgImageObjectPath(p); } }} />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="textDark" checked={heroTextDark} onChange={(e) => setHeroTextDark(e.target.checked)} className="rounded" />
              <label htmlFor="textDark" className="text-xs text-sidebar-foreground/70">Texto escuro no hero (para fundos claros)</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Botão (fundo)", val: ctaBgColor, set: setCtaBgColor },
                { label: "Botão (texto)", val: ctaTextColor, set: setCtaTextColor },
                { label: "Fundo da Página", val: pageBgColor, set: setPageBgColor },
                { label: "Texto da Página", val: pageTextColor, set: setPageTextColor },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <Label className="text-sidebar-foreground/60 text-xs">{label}</Label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={val} onChange={(e) => set(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                    <Input value={val} onChange={(e) => set(e.target.value)} className={`${S} flex-1 text-xs`} />
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>

          {/* Logo */}
          <AccordionSection title="🖼️ Logo & Ícone">
            <div>
              <Label className="text-sidebar-foreground/60 text-xs">Logo (aparece no hero)</Label>
              {logoObjectPath ? (
                <div className="flex items-center gap-2 mt-1">
                  <img src={`/api/storage${logoObjectPath}`} className="h-10 w-auto rounded object-contain bg-white/10 p-1" alt="logo" />
                  <Button variant="outline" size="sm" onClick={() => setLogoObjectPath(null)} className="border-sidebar-border text-sidebar-foreground/60 text-xs">Remover</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="mt-1 w-full border-sidebar-border text-sidebar-foreground/60"
                  onClick={() => logoRef.current?.click()} disabled={uploading === "logo"}>
                  {uploading === "logo" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                  Enviar Logo
                </Button>
              )}
              <input ref={logoRef} type="file" accept="image/*" className="hidden"
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const p = await uploadFile(f, "logo"); if (p) setLogoObjectPath(p); } }} />
            </div>
          </AccordionSection>

          {/* Content */}
          <AccordionSection title="✏️ Conteúdo Principal" defaultOpen>
            {[
              { label: "Título *", val: title, set: setTitle, ph: "Nome do App" },
              { label: "Subtítulo", val: subtitle, set: setSubtitle, ph: "Slogan ou frase curta" },
              { label: "Texto do Botão", val: buttonText, set: setButtonText, ph: "Baixar Aplicativo" },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <Label className="text-sidebar-foreground/60 text-xs">{label}</Label>
                <Input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} className={`mt-1 ${S}`} />
              </div>
            ))}
            <div>
              <Label className="text-sidebar-foreground/60 text-xs">Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`mt-1 ${S} resize-none`} />
            </div>
          </AccordionSection>

          {/* Custom Sections */}
          <AccordionSection title="📋 Seções de Texto">
            <div className="space-y-3">
              {sections.map((sec, i) => (
                <div key={sec.id} className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={sec.icon ?? ""} onChange={(e) => { const u = [...sections]; u[i] = { ...u[i], icon: e.target.value }; setSections(u); }}
                      placeholder="🚀" className={`${S} w-16 text-center`} />
                    <Input value={sec.title} onChange={(e) => { const u = [...sections]; u[i] = { ...u[i], title: e.target.value }; setSections(u); }}
                      placeholder="Título da seção" className={`${S} flex-1`} />
                    <Button variant="ghost" size="icon" onClick={() => setSections(sections.filter((_, j) => j !== i))}
                      className="text-sidebar-foreground/30 hover:text-destructive flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Textarea value={sec.body} onChange={(e) => { const u = [...sections]; u[i] = { ...u[i], body: e.target.value }; setSections(u); }}
                    placeholder="Conteúdo desta seção..." rows={2} className={`${S} resize-none text-xs`} />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setSections([...sections, { id: uuidv4(), title: "", body: "", icon: null }])}
                className="w-full gap-2 border-sidebar-border text-sidebar-foreground/60">
                <Plus className="w-4 h-4" /> Adicionar Seção
              </Button>
            </div>
          </AccordionSection>

          {/* App File */}
          <AccordionSection title="📱 Arquivo do App">
            <div className="rounded-xl border border-dashed border-sidebar-border bg-sidebar-accent/40 p-4 text-center">
              {appFileObjectPath ? (
                <div className="space-y-2">
                  <p className="text-xs text-green-400 font-medium">✓ Arquivo enviado</p>
                  <Button variant="outline" size="sm" onClick={() => setAppFileObjectPath(null)} className="border-sidebar-border text-sidebar-foreground/60 text-xs">Remover</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => appFileRef.current?.click()} disabled={uploading === "app"}
                  className="border-sidebar-border text-sidebar-foreground/60 w-full">
                  {uploading === "app" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Upload className="w-3.5 h-3.5 mr-1.5" /> APK / IPA / Arquivo</>}
                </Button>
              )}
              <input ref={appFileRef} type="file" className="hidden"
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const p = await uploadFile(f, "app"); if (p) setAppFileObjectPath(p); } }} />
            </div>
          </AccordionSection>

          {/* Video */}
          <AccordionSection title="🎬 Vídeo de Tutorial">
            <div>
              <Label className="text-sidebar-foreground/60 text-xs">Link YouTube / Vimeo</Label>
              <Input value={tutorialVideoUrl} onChange={(e) => setTutorialVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..." className={`mt-1 ${S}`} />
            </div>
            <div className="text-center text-sidebar-foreground/30 text-xs">ou envie um arquivo de vídeo</div>
            <div className="rounded-xl border border-dashed border-sidebar-border bg-sidebar-accent/40 p-4 text-center">
              {tutorialVideoObjectPath ? (
                <div className="space-y-1">
                  <p className="text-xs text-green-400">✓ Vídeo enviado</p>
                  <Button variant="outline" size="sm" onClick={() => setTutorialVideoObjectPath(null)} className="border-sidebar-border text-sidebar-foreground/60 text-xs">Remover</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => videoFileRef.current?.click()} disabled={uploading === "video"}
                  className="border-sidebar-border text-sidebar-foreground/60 w-full">
                  {uploading === "video" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Upload de Vídeo"}
                </Button>
              )}
              <input ref={videoFileRef} type="file" accept="video/*" className="hidden"
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const p = await uploadFile(f, "video"); if (p) setTutorialVideoObjectPath(p); } }} />
            </div>
          </AccordionSection>

          {/* Photos */}
          <AccordionSection title="📷 Fotos">
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-sidebar-accent group">
                  <img src={`/api/storage${photo.objectPath}`} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
              <button onClick={() => photoFileRef.current?.click()} disabled={!!uploading}
                className="aspect-square rounded-lg border border-dashed border-sidebar-border bg-sidebar-accent/40 flex flex-col items-center justify-center gap-1 hover:border-sidebar-primary transition-colors">
                {uploading === "foto" ? <Loader2 className="w-4 h-4 animate-spin text-sidebar-primary" /> : <><Plus className="w-4 h-4 text-sidebar-foreground/30" /><span className="text-xs text-sidebar-foreground/30">Add</span></>}
              </button>
            </div>
            <input ref={photoFileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={async (e) => { for (const file of Array.from(e.target.files ?? [])) { const p = await uploadFile(file, "foto"); if (p) setPhotos((prev) => [...prev, { objectPath: p! }]); } }} />
          </AccordionSection>

          {/* Social Links */}
          <AccordionSection title="🔗 Redes Sociais">
            <div className="space-y-2">
              {socialLinks.map((link, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input value={link.platform} onChange={(e) => { const u = [...socialLinks]; u[i] = { ...u[i], platform: e.target.value }; setSocialLinks(u); }}
                    placeholder="instagram" className={`${S} w-24 flex-shrink-0`} />
                  <Input value={link.url} onChange={(e) => { const u = [...socialLinks]; u[i] = { ...u[i], url: e.target.value }; setSocialLinks(u); }}
                    placeholder="https://..." className={`${S} flex-1`} />
                  <Input value={link.label} onChange={(e) => { const u = [...socialLinks]; u[i] = { ...u[i], label: e.target.value }; setSocialLinks(u); }}
                    placeholder="@usuario" className={`${S} w-24 flex-shrink-0`} />
                  <Button variant="ghost" size="icon" onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))}
                    className="text-sidebar-foreground/30 hover:text-destructive flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setSocialLinks([...socialLinks, { platform: "", url: "", label: "" }])}
                className="w-full gap-2 border-sidebar-border text-sidebar-foreground/60">
                <Plus className="w-3.5 h-3.5" /> Adicionar Rede Social
              </Button>
            </div>
          </AccordionSection>

          <Button className="w-full mt-4" onClick={handleSave} disabled={saving || !!uploading}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar Alterações
          </Button>
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex flex-col">
          <div className="px-4 py-2 bg-zinc-200/80 dark:bg-zinc-800/80 border-b border-zinc-300 dark:border-zinc-700 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white dark:bg-zinc-700 rounded-md px-3 py-1 text-xs text-zinc-400 font-mono">
              btmpage.com/p/{meData?.user?.username ?? "…"}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <LandingPageRenderer data={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
