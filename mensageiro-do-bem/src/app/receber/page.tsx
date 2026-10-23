import type { Metadata } from "next";
import { ReceberView } from "@/components/receber/ReceberView";

export const metadata: Metadata = {
  title: "Receber sua mensagem por PIX",
  description:
    "Abra sua mensagem com um PIX simbólico, acesso imediato e sem cadastro. Um gesto simples para receber carinho e ainda ajudar quem precisa.",
  alternates: {
    canonical: "/receber",
  },
  openGraph: {
    title: "Receber sua mensagem por PIX",
    description:
      "Contribua com um valor simbólico por PIX e receba sua mensagem na hora, em uma experiência rápida e acolhedora.",
    url: "/receber",
  },
  twitter: {
    title: "Receber sua mensagem por PIX",
    description:
      "Contribua com um valor simbólico por PIX e receba sua mensagem na hora.",
  },
};

export default function ReceberPage() {
  return <ReceberView />;
}
