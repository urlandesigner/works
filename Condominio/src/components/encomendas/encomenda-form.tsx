"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { adicionarEncomenda } from "@/lib/mock/encomendas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"

type FormValues = {
  unidade: string
  destinatario: string
  remetente: string
  descricao: string
  data: string
  observacoes: string
}

type FormErrors = Partial<Record<keyof Omit<FormValues, "observacoes">, string>>

function hoje() {
  return new Date().toISOString().split("T")[0]
}

const initial: FormValues = {
  unidade: "",
  destinatario: "",
  remetente: "",
  descricao: "",
  data: hoje(),
  observacoes: "",
}

export function EncomendaForm() {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>(initial)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function set(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (field in errors && errors[field as keyof FormErrors]) {
      const next = { ...errors }
      delete next[field as keyof FormErrors]
      setErrors(next)
    }
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!values.unidade.trim()) errs.unidade = "Unidade é obrigatória."
    if (!values.destinatario.trim()) errs.destinatario = "Destinatário é obrigatório."
    if (!values.remetente.trim()) errs.remetente = "Remetente é obrigatório."
    if (!values.descricao.trim()) errs.descricao = "Descrição é obrigatória."
    if (!values.data) errs.data = "Data de recebimento é obrigatória."
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    await new Promise((res) => setTimeout(res, 600))

    adicionarEncomenda({
      unidade: values.unidade.trim(),
      destinatario: values.destinatario.trim(),
      remetente: values.remetente.trim(),
      descricao: values.descricao.trim(),
      observacoes: values.observacoes.trim() || null,
      recebidaEm: new Date(`${values.data}T12:00:00`).toISOString(),
    })

    setLoading(false)
    setSucesso(true)
    await new Promise((res) => setTimeout(res, 1200))
    router.push("/encomendas")
  }

  function handleVoltar() {
    if (window.history.length > 1) router.back()
    else router.push("/encomendas")
  }

  if (sucesso) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-sm font-medium">Encomenda registrada com sucesso!</p>
        <p className="text-xs text-muted-foreground">Redirecionando para a listagem...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <button
        type="button"
        onClick={handleVoltar}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para encomendas
      </button>

      <div>
        <h2 className="text-lg font-semibold">Nova encomenda</h2>
        <p className="text-sm text-muted-foreground">Preencha os dados da encomenda recebida</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="rounded-lg border bg-white p-6 space-y-5">
        {/* Unidade */}
        <Field label="Unidade" required error={errors.unidade} hint="Ex: 301, 12B, Cobertura">
          <Input
            placeholder="Número da unidade"
            value={values.unidade}
            onChange={(e) => set("unidade", e.target.value)}
            className={cn(errors.unidade && "border-destructive focus-visible:ring-destructive")}
          />
        </Field>

        {/* Destinatário */}
        <Field label="Destinatário" required error={errors.destinatario}>
          <Input
            placeholder="Nome do morador"
            value={values.destinatario}
            onChange={(e) => set("destinatario", e.target.value)}
            className={cn(errors.destinatario && "border-destructive focus-visible:ring-destructive")}
          />
        </Field>

        {/* Remetente + Descrição */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Remetente" required error={errors.remetente}>
            <Input
              placeholder="Ex: Amazon, Correios"
              value={values.remetente}
              onChange={(e) => set("remetente", e.target.value)}
              className={cn(errors.remetente && "border-destructive focus-visible:ring-destructive")}
            />
          </Field>
          <Field label="Descrição" required error={errors.descricao} hint="Ex: Caixa média, Envelope">
            <Input
              placeholder="Tipo do volume"
              value={values.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              className={cn(errors.descricao && "border-destructive focus-visible:ring-destructive")}
            />
          </Field>
        </div>

        {/* Data de recebimento */}
        <Field label="Data de recebimento" required error={errors.data}>
          <Input
            type="date"
            value={values.data}
            onChange={(e) => set("data", e.target.value)}
            max={hoje()}
            className={cn(errors.data && "border-destructive focus-visible:ring-destructive")}
          />
        </Field>

        {/* Observações */}
        <Field label="Observações" hint="Informações adicionais sobre a encomenda (opcional)">
          <Textarea
            placeholder="Ex: Volume frágil, requer assinatura..."
            value={values.observacoes}
            onChange={(e) => set("observacoes", e.target.value)}
            rows={3}
            className="resize-none"
          />
        </Field>

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={handleVoltar} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="gap-2 min-w-36">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              "Registrar encomenda"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className={cn("text-sm font-medium", error && "text-destructive")}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
