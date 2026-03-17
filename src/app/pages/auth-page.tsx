import { useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Loader2, Sparkles, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { auth } from "../lib/supabase";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import girlClubImage from "figma:asset/b4f73c70509561e14c7a7104d7d022609cadadae.png";

export function AuthPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    name: "", 
    email: "", 
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("[Login] Attempting sign in...");
      const accessToken = await auth.signIn(loginData.email, loginData.password);
      
      if (!accessToken) {
        throw new Error("Falha ao obter token de autenticação");
      }
      
      console.log("[Login] Sign in successful, token obtained");
      console.log("[Login] Token preview:", accessToken.substring(0, 30));
      
      // Verify session was established
      const session = await auth.getSession();
      if (!session?.access_token) {
        throw new Error("Sessão não foi estabelecida corretamente");
      }
      
      console.log("[Login] Session verified, navigating to home");
      
      toast.success("Login realizado com sucesso! ✨");
      navigate("/");
    } catch (err: any) {
      console.error("[Login] Sign in error:", err);
      
      if (err.message?.includes("Invalid login credentials")) {
        setError(
          "Email ou senha incorretos. Ainda não tem conta? Clique em 'Criar Conta' acima."
        );
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Por favor, confirme seu email antes de fazer login.");
      } else {
        setError(err.message || "Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      // Call server to create user
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-93f7c220/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: signupData.email,
            password: signupData.password,
            name: signupData.name,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create account");
      }

      toast.success("Conta criada com sucesso! ✨");
      
      // Auto login after signup
      console.log("Auto-login after signup...");
      await auth.signIn(signupData.email, signupData.password);
      
      // Small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate("/");
    } catch (err: any) {
      console.error("Sign up error:", err);
      
      if (err.message?.includes("already registered")) {
        setError("Este email já está cadastrado. Redirecionando para login...");
        toast.error("Email já cadastrado! Por favor, faça login.");
        
        // Automatically switch to login mode after 1.5 seconds
        setTimeout(() => {
          setActiveTab("login");
          setError("");
          // Pre-fill the email in login form
          setLoginData({ email: signupData.email, password: "" });
        }, 1500);
      } else if (err.message?.includes("Invalid email")) {
        setError("Email inválido. Por favor, verifique o email digitado.");
      } else {
        setError(err.message || "Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-400/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Girl Club Image - Hidden on mobile */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 rounded-3xl blur-2xl opacity-50"></div>
            <img 
              src={girlClubImage} 
              alt="Girl Club - Um clube só nosso! Onde a leitura se encontra com a amizade" 
              className="relative rounded-3xl shadow-2xl max-w-md w-full"
            />
          </div>
        </div>

        {/* Auth Form */}
        <div className="w-full">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-pink-300/50 relative">
              <BookOpen className="w-10 h-10 text-white" />
              <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 bg-clip-text text-transparent mb-2 font-handwriting">
              MinhaEstante
            </h1>
            <p className="text-pink-700 flex items-center justify-center gap-1">
              Suas leituras com muito amor <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
            </p>
          </div>

          {/* Auth Card */}
          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-xl shadow-2xl border-pink-200 rounded-3xl">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-pink-100/50 p-1 rounded-2xl">
                <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  Criar Conta
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-pink-900">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="h-11 bg-pink-50/50 border-pink-200 focus:border-pink-400 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-pink-900">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="h-11 bg-pink-50/50 border-pink-200 focus:border-pink-400 rounded-xl"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-300/50 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-pink-900">Nome</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome"
                      required
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      className="h-11 bg-pink-50/50 border-pink-200 focus:border-pink-400 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-pink-900">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="h-11 bg-pink-50/50 border-pink-200 focus:border-pink-400 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-pink-900">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="h-11 bg-pink-50/50 border-pink-200 focus:border-pink-400 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-pink-900">Confirmar Senha</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="h-11 bg-pink-50/50 border-pink-200 focus:border-pink-400 rounded-xl"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-300/50 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      <>
                        Criar Conta <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-pink-700 mt-6 flex items-center justify-center gap-1">
            Feito com <Heart className="w-4 h-4 fill-pink-500 text-pink-500 animate-pulse" /> para leitoras
          </p>
        </div>
      </div>
    </div>
  );
}