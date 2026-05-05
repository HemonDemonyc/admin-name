import { useState, useRef, useEffect } from "react";
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
import { ArrowLeft, Plus, Trash2, Upload, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SocialLink = { platform: string; url: string; label: string };
type LandingPhoto = { objectPath: string; caption?: string | null };

const TEMPLATES = [
  { id: "vivid", name: "Vivid", bg: "from-violet-600 to-indigo-600", preview: "bg-gradient-to-br from-violet-600 to-indigo-600" },
  { id: "dark", name: "Dark", bg: "from-zinc-900 to-zinc-800", preview: "bg-gradient-to-br from-zinc-900 to-zinc-800" },
  { id: "nature", name: "Nature", bg: "from-emerald-500 to-teal-600", preview: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  { id: "sunset", name: "Sunset", bg: "from-orange-500 to-rose-500", preview: "bg-gradient-to-br from-orange-500 to-rose-500" },
];

export default function DashboardLanding() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: meData } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: landing, isLoading } = useGetMyLanding({ query: { queryKey: getGetMyLandingQueryKey() } });

  const [template, setTemplate] = useState("vivid");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState("");
  const [appFileObjectPath, setAppFileObjectPath] = useState<string | null>(null);
  const [tutorialVideoObjectPath, setTutorialVideoObjectPath] = useState<string | null>(null);
  const [photos, setPhotos] = useState<LandingPhoto[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const appFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const photoFileRef = useRef<HTMLInputElement>(null);

  const requestUploadUrl = useRequestUploadUrl();
  const updateLanding = useUpdateMyLanding({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyLandingQueryKey() });
        toast({ title: "Salvo com sucesso!" });
      },
      onError: () => toast({ title: "Erro ao salvar", variant: "destructive" }),
    },
  });

  useEffect(() => {
    if (meData && !meData.user) setLocation("/login");
  }, [meData]);

  if (landing && !initialized) {
    setTemplate(landing.template ?? "vivid");
    setTitle(landing.title ?? "");
    setSubtitle(landing.subtitle ?? "");
    setDescription(landing.description ?? "");
    setButtonText(landing.buttonText ?? "");
    setTutorialVideoUrl(landing.tutorialVideoUrl ?? "");
    setAppFileObjectPath(landing.appFileObjectPath ?? null);
    setTutorialVideoObjectPath(landing.tutorialVideoObjectPath ?? null);
    setPhotos((landing.photos as LandingPhoto[]) ?? []);
    setSocialLinks((landing.socialLinks as SocialLink[]) ?? []);
    setInitialized(true);
  }

  async function uploadFile(file: File, label: string): Promise<string | null> {
    setUploading(label);
    try {
      const res = await new Promise<{ uploadURL: string; objectPath: string }>((resolve, reject) => {
        requestUploadUrl.mutate(
          { data: { name: file.name, size: file.size, contentType: file.type } },
          { onSuccess: resolve, onError: reject },
        );
      });
      await fetch(res.uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      return res.objectPath;
    } catch {
      toast({ title: `Erro ao fazer upload de ${label}`, variant: "destructive" });
      return null;
    } finally {
      setUploading(null);
    }
  }

  async function handleAppFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const path = await uploadFile(file, "app"); if (path) setAppFileObjectPath(path);
  }
  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const path = await uploadFile(file, "video"); if (path) setTutorialVideoObjectPath(path);
  }
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    for (const file of Array.from(e.target.files ?? [])) {
      const path = await uploadFile(file, "foto");
      if (path) setPhotos((prev) => [...prev, { objectPath: path! }]);
    }
  }

  function handleSave() {
    updateLanding.mutate({
      data: {
        template, title,
        subtitle: subtitle || null,
        description: description || null,
        buttonText: buttonText || null,
        tutorialVideoUrl: tutorialVideoUrl || null,
        appFileObjectPath,
        tutorialVideoObjectPath,
        photos,
        socialLinks,
      },
    });
  }

  if (isLoading) {
    return <div className="min-h-screen bg-sidebar flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const S = "bg-sidebar-accent border-sidebar-border text-sidebar-foreground";

  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      <header className="border-b border-sidebar-border px-6 py-4 flex items-center gap-3 sticky top-0 z-10 bg-sidebar">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="text-sidebar-foreground/60 hover:text-sidebar-foreground gap-1">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <h1 className="text-base font-bold">Editar Landing Page</h1>
        <Button size="sm" className="ml-auto gap-2" onClick={handleSave} disabled={updateLanding.isPending || !!uploading}>
          {updateLanding.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Salvar
        </Button>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">

        {/* Template Picker */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Template Visual</h2>
          <div className="grid grid-cols-4 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`relative rounded-xl overflow-hidden aspect-[3/4] transition-all ${template === t.id ? "ring-2 ring-primary ring-offset-2 ring-offset-sidebar" : "opacity-70 hover:opacity-100"}`}
              >
                <div className={`w-full h-full ${t.preview}`}>
                  <div className="p-3 flex flex-col gap-1.5">
                    <div className="w-8 h-1.5 rounded-full bg-white/40" />
                    <div className="w-12 h-1.5 rounded-full bg-white/25" />
                    <div className="mt-1 rounded-lg bg-white/15 h-12" />
                    <div className="w-10 h-4 rounded bg-white/30 mt-1" />
                  </div>
                </div>
                {template === t.id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/40 py-1 text-center text-xs text-white font-medium">{t.name}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Basic info */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Informações</h2>
          <div>
            <Label className="text-sidebar-foreground/70">Título *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className={`mt-1.5 ${S}`} />
          </div>
          <div>
            <Label className="text-sidebar-foreground/70">Subtítulo</Label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Slogan ou frase curta" className={`mt-1.5 ${S}`} />
          </div>
          <div>
            <Label className="text-sidebar-foreground/70">Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`mt-1.5 ${S} resize-none`} rows={4} />
          </div>
          <div>
            <Label className="text-sidebar-foreground/70">Texto do Botão de Download</Label>
            <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Baixar Aplicativo" className={`mt-1.5 ${S}`} />
          </div>
        </section>

        {/* App file */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Arquivo do App</h2>
          <div className="rounded-xl border border-dashed border-sidebar-border bg-sidebar-accent p-6 text-center">
            {appFileObjectPath ? (
              <div className="space-y-2">
                <p className="text-sm text-green-400 font-medium">✓ Arquivo enviado</p>
                <p className="text-xs text-sidebar-foreground/40 break-all">{appFileObjectPath}</p>
                <Button variant="outline" size="sm" onClick={() => setAppFileObjectPath(null)}>Remover</Button>
              </div>
            ) : (
              <>
                <Upload className="w-7 h-7 text-sidebar-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-sidebar-foreground/40 mb-3">APK, IPA ou qualquer arquivo</p>
                <Button variant="outline" size="sm" onClick={() => appFileRef.current?.click()} disabled={uploading === "app"}>
                  {uploading === "app" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Selecionar arquivo"}
                </Button>
              </>
            )}
            <input ref={appFileRef} type="file" className="hidden" onChange={handleAppFileUpload} />
          </div>
        </section>

        {/* Tutorial video */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Vídeo de Tutorial</h2>
          <div>
            <Label className="text-sidebar-foreground/70">Link do Vídeo (YouTube, etc)</Label>
            <Input value={tutorialVideoUrl} onChange={(e) => setTutorialVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={`mt-1.5 ${S}`} />
          </div>
          <div className="text-center text-sidebar-foreground/30 text-xs">ou envie um arquivo</div>
          <div className="rounded-xl border border-dashed border-sidebar-border bg-sidebar-accent p-4 text-center">
            {tutorialVideoObjectPath ? (
              <div className="space-y-2">
                <p className="text-sm text-green-400 font-medium">✓ Vídeo enviado</p>
                <Button variant="outline" size="sm" onClick={() => setTutorialVideoObjectPath(null)}>Remover vídeo</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => videoFileRef.current?.click()} disabled={uploading === "video"}>
                {uploading === "video" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload de Vídeo"}
              </Button>
            )}
            <input ref={videoFileRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
          </div>
        </section>

        {/* Photos */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Fotos</h2>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-sidebar-accent group">
                <img src={`/api/storage${photo.objectPath}`} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <button onClick={() => photoFileRef.current?.click()} disabled={!!uploading}
              className="aspect-square rounded-lg border border-dashed border-sidebar-border bg-sidebar-accent flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors">
              {uploading === "foto" ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <>
                <Plus className="w-5 h-5 text-sidebar-foreground/40" />
                <span className="text-xs text-sidebar-foreground/40">Adicionar</span>
              </>}
            </button>
          </div>
          <input ref={photoFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
        </section>

        {/* Social Links */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Redes Sociais</h2>
          <div className="space-y-3">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {(["platform", "url", "label"] as const).map((field, fi) => (
                    <Input key={fi} value={link[field]} onChange={(e) => {
                      const u = [...socialLinks]; u[i] = { ...u[i], [field]: e.target.value }; setSocialLinks(u);
                    }} placeholder={field === "platform" ? "instagram" : field === "url" ? "https://..." : "@usuario"}
                      className={`${S} text-sm`} />
                  ))}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))}
                  className="text-sidebar-foreground/40 hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setSocialLinks([...socialLinks, { platform: "", url: "", label: "" }])}
              className="gap-2 border-sidebar-border text-sidebar-foreground/60">
              <Plus className="w-4 h-4" /> Adicionar rede social
            </Button>
          </div>
        </section>

        <Button className="w-full" onClick={handleSave} disabled={updateLanding.isPending || !!uploading}>
          {updateLanding.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
