import { redirect } from "next/navigation";

/** Rota legada: fluxo de pagamento passou a ser `/receber`. */
export default function PagamentoPage() {
  redirect("/receber");
}
