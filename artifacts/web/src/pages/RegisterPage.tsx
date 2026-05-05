import { useState } from "react";
import { useLocation } from "wouter";
import { useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const register = useRegister({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error ?? "Erro ao criar conta";
        toast({ title: msg, variant: "destructive" });
      },
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register.mutate({ data: { name, email, username, password } });
  }

  const slugPreview = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");

  return (
    <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-sidebar-foreground">Criar conta</h1>
          <p className="text-sm text-sidebar-foreground/50 mt-1">Comece a usar gratuitamente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sidebar-foreground/70">Seu nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João Silva"
              required
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              autoComplete="name"
            />
          </div>
          <div>
            <Label className="text-sidebar-foreground/70">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              autoComplete="email"
            />
          </div>
          <div>
            <Label className="text-sidebar-foreground/70">Nome de usuário</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="joaosilva"
              required
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              autoComplete="username"
            />
            {slugPreview && (
              <p className="text-xs text-sidebar-foreground/40 mt-1">
                Sua página: <span className="text-primary font-medium">/p/{slugPreview}</span>
              </p>
            )}
          </div>
          <div>
            <Label className="text-sidebar-foreground/70">Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Criar conta
          </Button>
        </form>

        <p className="text-center text-sm text-sidebar-foreground/40 mt-6">
          Já tem conta?{" "}
          <button
            className="text-primary hover:underline font-medium"
            onClick={() => setLocation("/login")}
          >
            Entrar
          </button>
        </p>

        <p className="text-center mt-4">
          <button
            className="text-xs text-sidebar-foreground/30 hover:text-sidebar-foreground/50"
            onClick={() => setLocation("/")}
          >
            ← Voltar ao início
          </button>
        </p>
      </div>
    </div>
  );
}
