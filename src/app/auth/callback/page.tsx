"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Controlla se ci sono parametri di errore nell'URL
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        const errorDescription = params.get("error_description");

        if (error) {
          setStatus("error");
          setErrorMessage(
            errorDescription || "Errore durante l'autenticazione"
          );
          setTimeout(() => router.push("/auth"), 3000);
          return;
        }

        // Ottieni la sessione dall'hash URL o dai parametri
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session) {
          // Verifica se l'utente ha un profilo
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", session.user.id)
            .single();

          // Se non ha un profilo, crealo (safety net per OAuth)
          if (!profile) {
            const username =
              session.user.email?.split("@")[0] ||
              session.user.user_metadata?.full_name
                ?.replace(/\s+/g, "_")
                .toLowerCase() ||
              "user";

            await (supabase.from("profiles") as any).insert({
              id: session.user.id,
              username: username,
              display_name: session.user.user_metadata?.full_name || username,
              avatar_url: session.user.user_metadata?.avatar_url || null,
              reliability_score: 0,
              total_reviews: 0,
              verified_reviews: 0,
              quiz_success_rate: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }

          setStatus("success");
          setTimeout(() => router.push("/"), 1500);
        } else {
          throw new Error("Nessuna sessione trovata");
        }
      } catch (err: any) {
        console.error("Errore callback OAuth:", err);
        setStatus("error");
        setErrorMessage(err.message || "Errore durante l'autenticazione");
        setTimeout(() => router.push("/auth"), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {status === "loading" && (
          <div className="space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Autenticazione in corso...
              </h2>
              <p className="text-slate-400">Attendere prego</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="space-y-6"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Accesso Effettuato! ✓</h2>
              <p className="text-slate-400">Reindirizzamento alla home...</p>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="space-y-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="mx-auto w-20 h-20 bg-red-500 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Errore di Autenticazione
              </h2>
              <p className="text-slate-400 mb-4">{errorMessage}</p>
              <p className="text-sm text-slate-500">
                Reindirizzamento alla pagina di login...
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
