import { useState, useRef } from "react";
import { useLocation } from "wouter";
import {
  useGetLanding,
  useUpdateLanding,
  useGetAuthMe,
  useRequestUploadUrl,
  getGetLandingQueryKey,
  getGetAuthMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SocialLink = { platform: string; url: string; label: string };
type LandingPhoto = { objectPath: string; caption?: string | null };

export default function AdminLanding() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: auth } = useGetAuthMe({ query: { queryKey: getGetAuthMeQueryKey() } });
  const { data: landing, isLoading } = useGetLanding({ query: { queryKey: getGetLandingQueryKey() } });

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
  const updateLanding = useUpdateLanding({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetLandingQueryKey() });
        toast({ title: "Salvo com sucesso!" });
      },
      onError: () => {
        toast({ title: "Erro ao salvar", variant: "destructive" });
      },
    },
  });

  if (auth && !auth.authenticated) {
    setLocation("/admin");
    return null;
  }

  if (landing && !initialized) {
    setTitle(landing.title ?? "");
    setSubtitle(landing.subtitle ?? "");
    setDescription(landing.description ?? "");
    setButtonText(landing.buttonText ?? "");
    setTutorialVideoUrl(landing.tutorialVideoUrl ?? "");
    setAppFileObjectPath(landing.appFileObjectPath ?? null);
    setTutorialVideoObjectPath(landing.tutorialVideoObjectPath ?? null);
    setPhotos(landing.photos ?? []);
    setSocialLinks(landing.socialLinks ?? []);
    setInitialized(true);
  }

  async function uploadFile(file: File, label: string): Promise<string | null> {
    setUploading(label);
    try {
      const res = await new Promise<{ uploadURL: string; objectPath: string }>((resolve, reject) => {
        requestUploadUrl.mutate(
          { data: { name: file.name, size: file.size, contentType: file.type } },
          {
            onSuccess: resolve,
            onError: reject,
          }
        );
      });
      await fetch(res.uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      return res.objectPath;
    } catch {
      toast({ title: `Erro ao fazer upload de ${label}`, variant: "destructive" });
      return null;
    } finally {
      setUploading(null);
    }
  }

  async function handleAppFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = await uploadFile(file, "app");
    if (path) setAppFileObjectPath(path);
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = await uploadFile(file, "video");
    if (path) setTutorialVideoObjectPath(path);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      const path = await uploadFile(file, "foto");
      if (path) {
        setPhotos((prev) => [...prev, { objectPath: path }]);
      }
    }
  }

  function handleSave() {
    updateLanding.mutate({
      data: {
        title,
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
        <h1 className="text-base font-bold text-sidebar-foreground">Editar Landing Page</h1>
        <Button
          size="sm"
          className="ml-auto"
          onClick={handleSave}
          disabled={updateLanding.isPending}
          data-testid="button-save-landing"
        >
          {updateLanding.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
        </Button>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Basic info */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider">Informacoes</h2>
          <div>
            <Label className="text-sidebar-foreground/70">Titulo</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              data-testid="input-title"
            />
          </div>
          <div>
            <Label className="text-sidebar-foreground/70">Subtitulo</Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              data-testid="input-subtitle"
            />
          </div>
          <div>
            <Label className="text-sidebar-foreground/70">Descricao</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground resize-none"
              rows={4}
              data-testid="textarea-description"
            />
          </div>
          <div>
            <Label className="text-sidebar-foreground/70">Texto do Botao de Download</Label>
            <Input
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Ex: Baixar Aplicativo"
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              data-testid="input-button-text"
            />
          </div>
        </section>

        {/* App file */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider">Arquivo do App</h2>
          <div className="rounded-xl border border-dashed border-sidebar-border bg-sidebar-accent p-6 text-center">
            {appFileObjectPath ? (
              <div className="space-y-2">
                <p className="text-sm text-sidebar-foreground/70 break-all">{appFileObjectPath}</p>
                <Button variant="outline" size="sm" onClick={() => setAppFileObjectPath(null)}>
                  Remover
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-sidebar-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-sidebar-foreground/50 mb-3">APK, IPA ou qualquer arquivo</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => appFileRef.current?.click()}
                  disabled={uploading === "app"}
                  data-testid="button-upload-app"
                >
                  {uploading === "app" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Selecionar arquivo"}
                </Button>
              </>
            )}
            <input ref={appFileRef} type="file" className="hidden" onChange={handleAppFileUpload} />
          </div>
        </section>

        {/* Tutorial video */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider">Video de Tutorial</h2>
          <div>
            <Label className="text-sidebar-foreground/70">Link do Video (YouTube, etc)</Label>
            <Input
              value={tutorialVideoUrl}
              onChange={(e) => setTutorialVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              data-testid="input-video-url"
            />
          </div>
          <div className="text-center text-sidebar-foreground/30 text-xs">ou</div>
          <div className="rounded-xl border border-dashed border-sidebar-border bg-sidebar-accent p-4 text-center">
            {tutorialVideoObjectPath ? (
              <div className="space-y-2">
                <p className="text-sm text-sidebar-foreground/70 break-all">{tutorialVideoObjectPath}</p>
                <Button variant="outline" size="sm" onClick={() => setTutorialVideoObjectPath(null)}>
                  Remover video
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => videoFileRef.current?.click()}
                  disabled={uploading === "video"}
                  data-testid="button-upload-video"
                >
                  {uploading === "video" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload de Video"}
                </Button>
              </>
            )}
            <input ref={videoFileRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
          </div>
        </section>

        {/* Photos */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider">Fotos</h2>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-sidebar-accent group">
                <img
                  src={`/api/storage${photo.objectPath}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`button-remove-photo-${i}`}
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <button
              onClick={() => photoFileRef.current?.click()}
              disabled={!!uploading}
              className="aspect-square rounded-lg border border-dashed border-sidebar-border bg-sidebar-accent flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors"
              data-testid="button-add-photo"
            >
              {uploading === "foto" ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <>
                  <Plus className="w-5 h-5 text-sidebar-foreground/40" />
                  <span className="text-xs text-sidebar-foreground/40">Adicionar</span>
                </>
              )}
            </button>
          </div>
          <input ref={photoFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
        </section>

        {/* Social Links */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider">Redes Sociais</h2>
          <div className="space-y-3">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input
                    value={link.platform}
                    onChange={(e) => {
                      const updated = [...socialLinks];
                      updated[i] = { ...updated[i], platform: e.target.value };
                      setSocialLinks(updated);
                    }}
                    placeholder="instagram"
                    className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground text-sm"
                    data-testid={`input-social-platform-${i}`}
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...socialLinks];
                      updated[i] = { ...updated[i], url: e.target.value };
                      setSocialLinks(updated);
                    }}
                    placeholder="https://..."
                    className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground text-sm"
                    data-testid={`input-social-url-${i}`}
                  />
                  <Input
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...socialLinks];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setSocialLinks(updated);
                    }}
                    placeholder="@usuario"
                    className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground text-sm"
                    data-testid={`input-social-label-${i}`}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))}
                  className="text-sidebar-foreground/40 hover:text-destructive"
                  data-testid={`button-remove-social-${i}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSocialLinks([...socialLinks, { platform: "", url: "", label: "" }])}
              className="gap-2 border-sidebar-border text-sidebar-foreground/60"
              data-testid="button-add-social"
            >
              <Plus className="w-4 h-4" />
              Adicionar rede social
            </Button>
          </div>
        </section>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={updateLanding.isPending}
          data-testid="button-save-landing-bottom"
        >
          {updateLanding.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Salvar alteracoes
        </Button>
      </div>
    </div>
  );
}
