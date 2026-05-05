import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Smartphone, Image, Link2, Palette, ArrowRight, Check } from "lucide-react";

const FEATURES = [
  { icon: Smartphone, title: "Página de Download", desc: "Apresente seu app com título, descrição, vídeo e fotos." },
  { icon: Image, title: "Galeria Privada", desc: "Álbum exclusivo acessível apenas de dentro do seu app." },
  { icon: Link2, title: "Links Sociais", desc: "Centralize todos os seus perfis em um só lugar." },
  { icon: Palette, title: "Templates Visuais", desc: "Escolha entre 4 temas de design com um clique." },
];

const TEMPLATES = [
  { name: "Vivid", bg: "from-violet-600 to-indigo-600", text: "text-white" },
  { name: "Dark", bg: "from-zinc-900 to-zinc-800", text: "text-white" },
  { name: "Nature", bg: "from-emerald-500 to-teal-600", text: "text-white" },
  { name: "Sunset", bg: "from-orange-500 to-rose-500", text: "text-white" },
];

export default function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-serif font-bold text-xl text-foreground">BTMPage</span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/login")}>Entrar</Button>
          <Button size="sm" onClick={() => setLocation("/register")}>Criar conta</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Gratuito para sempre no plano básico
        </div>
        <h1 className="font-serif text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Sua landing page para<br />
          <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">distribuir seu app</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Crie uma página profissional para divulgar seu app móvel, com galeria de fotos, vídeo de tutorial, links sociais e muito mais. Pronto em minutos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="gap-2 px-8 text-base" onClick={() => setLocation("/register")}>
            Criar minha página grátis
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => setLocation("/login")}>
            Já tenho conta
          </Button>
        </div>
      </section>

      {/* Template preview */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-6 font-medium uppercase tracking-wider">4 Templates incluídos</p>
        <div className="grid grid-cols-4 gap-3">
          {TEMPLATES.map((t) => (
            <div
              key={t.name}
              className={`bg-gradient-to-br ${t.bg} rounded-2xl p-5 flex flex-col gap-2 aspect-[3/4]`}
            >
              <div className="w-10 h-2 rounded-full bg-white/30" />
              <div className="w-16 h-2 rounded-full bg-white/20 mt-1" />
              <div className="flex-1 rounded-xl bg-white/10 mt-2" />
              <div className={`text-xs font-semibold ${t.text} opacity-80 mt-1`}>{t.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-6 rounded-2xl border border-border bg-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-2xl mx-auto text-center">
        <div className="bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-primary/20 rounded-3xl p-12">
          <h2 className="font-serif text-3xl font-bold mb-4">Comece agora, é grátis</h2>
          <p className="text-muted-foreground mb-8">Crie sua conta e tenha sua página no ar em menos de 5 minutos.</p>
          <div className="flex flex-col gap-2 items-center mb-8">
            {["Sem cartão de crédito", "Domínio gratuito incluído", "Edite a qualquer hora"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                {item}
              </div>
            ))}
          </div>
          <Button size="lg" className="px-10 gap-2" onClick={() => setLocation("/register")}>
            Criar conta grátis
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted-foreground">
        BTMPage — Todos os direitos reservados
      </footer>
    </div>
  );
}
