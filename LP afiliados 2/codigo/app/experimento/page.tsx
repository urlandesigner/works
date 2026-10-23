import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ExperimentoContent } from "./ExperimentoContent";

// Inter de peso variável, só nesta rota — a LP principal continua na Geist.
// next/font faz self-host no build (funciona com output: export).
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Experimento — Bodum Chambord (dark premium)",
  // noindex: é laboratório visual, não deve competir com a LP real na busca.
  robots: { index: false, follow: false },
};

export default function ExperimentoPage() {
  return (
    <div className={`${inter.variable} flex-1`}>
      <ExperimentoContent />
    </div>
  );
}
