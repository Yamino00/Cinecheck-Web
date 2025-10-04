"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  FilmIcon,
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccess(true);
        setTimeout(() => router.push("/"), 1000);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              display_name: username,
            },
          },
        });
        if (error) throw error;
        setSuccess(true);
        setTimeout(() => router.push("/auth/confirm"), 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setIsGoogleLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sfondo animato con particelle */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bg-primary/10 rounded-full -top-20 -left-40 w-96 h-96 blur-3xl animate-pulse"></div>
        <div className="absolute bg-accent/10 rounded-full -bottom-20 -right-40 w-96 h-96 blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bg-neon-purple/5 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-3xl animate-float"></div>
      </div>

      {/* Griglia decorativa */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "register"}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              variant="glass"
              className="w-full backdrop-blur-xl border-white/10 shadow-2xl"
            >
              <CardHeader className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="mx-auto mb-4"
                >
                  <div className="relative">
                    <FilmIcon className="h-16 w-16 text-primary animate-pulse" />
                    <motion.div
                      className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <CardTitle className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {isLogin
                      ? "Bentornato su Cinecheck"
                      : "Unisciti a Cinecheck"}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {isLogin
                      ? "Accedi per scoprire recensioni verificate."
                      : "Registrati e dì la tua sul cinema."}
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-5">
                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="username">Username</Label>
                        <div className="relative group">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Input
                            id="username"
                            type="text"
                            placeholder="Il tuo username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative group">
                      <AtSymbolIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tua@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative group">
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 transition-all focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                      >
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-400">
                          {isLogin
                            ? "Accesso effettuato!"
                            : "Registrazione completata!"}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    className="w-full relative overflow-hidden group"
                    disabled={loading || success}
                    variant="premium"
                  >
                    <span className="relative z-10">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="inline-block"
                          >
                            ⚡
                          </motion.span>
                          Caricamento...
                        </span>
                      ) : success ? (
                        "✓ Fatto!"
                      ) : isLogin ? (
                        "Accedi"
                      ) : (
                        "Registrati"
                      )}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-900 text-slate-400">
                      Oppure continua con
                    </span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || loading || success}
                  variant="outline"
                  className="w-full relative overflow-hidden group bg-white hover:bg-gray-50 text-gray-800 border-gray-300"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isGoogleLoading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="inline-block"
                        >
                          ⚡
                        </motion.span>
                        Connessione in corso...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continua con Google
                      </>
                    )}
                  </span>
                </Button>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-400">
                    {isLogin ? "Non hai un account?" : "Hai già un account?"}
                    <motion.button
                      onClick={toggleMode}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="ml-2 font-semibold text-primary hover:text-accent transition-colors relative group"
                    >
                      {isLogin ? "Registrati" : "Accedi"}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                    </motion.button>
                  </p>
                </div>

                {isLogin && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 text-center"
                  >
                    <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                      Password dimenticata?
                    </button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
