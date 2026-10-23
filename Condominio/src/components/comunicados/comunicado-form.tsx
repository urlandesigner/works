"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { adicionarComunicado, type CategoriaComunicado } from "@/lib/mock/comunicados"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ArrowLeft, CheckCircle, Loader2, Pin } from "lucide-react"

type FormValues = {
  titulo: string
  categoria: CategoriaComunicado | ""
  conteudo: string
  fixado: boolean
}

type FormErrors = Partial<Record<"titulo" | "categoria" | "conteudo", string>>

const initial: FormValues = { titulo: "", categoria: "", conteudo: "", fixado: false }

export function ComunicadoForm() {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>(initial)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function set<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (field !== "fixado" && errors[field as keyof FormErrors]) {
      const next = { ...errors }
      delete next[field as keyof FormErrors]
      setErrors(next)
    }
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!values.titulo.trim()) errs.titulo = "Título é obrigatório."
    if (!values.categoria) errs.categoria = "Selecione uma categoria."
    if (!values.conteudo.trim()) errs.conteudo = "Conteúdo é obrigatório."
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

    adicionarComunicado({
      titulo: values.titulo.trim(),
      conteudo: values.conteudo.trim(),
      categoria: values.categoria as CategoriaComunicado,
      fixado: values.fixado,
    })

    setLoading(false)
    setSucesso(true)
    await new Promise((res) => setTimeout(res, 1200))
    router.push("/comunicados")
  }

  function handleVoltar() {
    if (window.history.length > 1) router.back()
    else router.push("/comunicados")
  }

  if (sucesso) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-sm font-medium">Comunicado publicado com sucesso!</p>
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
        Voltar para comunicados
      </button>

      <div>
        <h2 className="text-lg font-semibold">Novo comunicado</h2>
        <p className="text-sm text-muted-foreground">Preencha as informações do comunicado</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="rounded-lg border bg-white p-6 space-y-5">
        {/* Título */}
        <Field label="Título" required error={errors.titulo}>
          <Input
            placeholder="Título do comunicado"
            value={values.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            className={cn(errors.titulo && "border-destructive focus-visible:ring-destructive")}
          />
        </Field>

        {/* Categoria + Fixado */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoria" required error={errors.categoria}>
            <Select
              value={values.categoria}
              onValueChange={(v) => v && set("categoria", v as CategoriaComunicado)}
            >
              <SelectTrigger className={cn(errors.categoria && "border-destructive")}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GERAL">Geral</SelectItem>
                <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                <SelectItem value="SEGURANCA">Segurança</SelectItem>
                <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
                <SelectItem value="EVENTOS">Eventos</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Fixar no topo" hint="Comunicado permanece destacado na listagem">
            <button
              type="button"
              onClick={() => set("fixado", !values.fixado)}
              className={cn(
                "flex items-center gap-2 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                values.fixado
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-input text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              <Pin className={cn("h-4 w-4 shrink-0", values.fixado && "fill-primary")} />
              {values.fixado ? "Fixado" : "Não fixado"}
            </button>
          </Field>
        </div>

        {/* Conteúdo */}
        <Field label="Conteúdo" required error={errors.conteudo}>
          <Textarea
            placeholder="Escreva o comunicado completo aqui..."
            value={values.conteudo}
            onChange={(e) => set("conteudo", e.target.value)}
            rows={6}
            className={cn(
              "resize-none",
              errors.conteudo && "border-destructive focus-visible:ring-destructive"
            )}
          />
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">{values.conteudo.length} caracteres</span>
          </div>
        </Field>

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={handleVoltar} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="gap-2 min-w-32">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              "Publicar"
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
