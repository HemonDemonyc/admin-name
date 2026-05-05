import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAuthMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const login = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        if (data.authenticated) {
          queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
          setLocation("/admin/dashboard");
        } else {
          setError("Senha incorreta.");
        }
      },
      onError: () => {
        setError("Senha incorreta.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate({ data: { password } });
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-sidebar-foreground">Painel Admin</h1>
          <p className="text-sm text-sidebar-foreground/50 mt-1">Acesso restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-sidebar-foreground/70 text-sm">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="mt-1.5 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30"
              data-testid="input-admin-password"
              required
            />
          </div>

          {error && (
            <p className="text-destructive text-sm" data-testid="text-login-error">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={login.isPending}
            data-testid="button-admin-login"
          >
            {login.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
