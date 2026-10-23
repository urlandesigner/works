"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { adicionarChamado, type CategoriaChamado, type Prioridade } from "@/lib/mock/chamados"
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
import { ArrowLeft, Upload, X, CheckCircle, Loader2 } from "lucide-react"

type FormValues = {
  titulo: string
  categoria: CategoriaChamado | ""
  prioridade: Prioridade | ""
  unidade: string
  descricao: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = {
  titulo: "",
  categoria: "",
  prioridade: "",
  unidade: "",
  descricao: "",
}

export function ChamadoForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [imagem, setImagem] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function set(field: keyof FormValues, value: string | null) {
    if (value === null) return
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      const next = { ...errors }
      delete next[field]
      setErrors(next)
    }
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!values.titulo.trim()) errs.titulo = "Título é obrigatório."
    if (!values.categoria) errs.categoria = "Selecione uma categoria."
    if (!values.prioridade) errs.prioridade = "Selecione uma prioridade."
    if (!values.unidade.trim()) errs.unidade = "Unidade é obrigatória."
    if (!values.descricao.trim()) errs.descricao = "Descrição é obrigatória."
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      const firstErrorField = document.querySelector("[data-error]")
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    setLoading(true)

    await new Promise((res) => setTimeout(res, 600))

    adicionarChamado({
      titulo: values.titulo.trim(),
      descricao: values.descricao.trim(),
      categoria: values.categoria as CategoriaChamado,
      prioridade: values.prioridade as Prioridade,
      unidade: values.unidade.trim(),
      nomeReq: "Portaria",
    })

    setLoading(false)
    setSucesso(true)

    await new Promise((res) => setTimeout(res, 1200))
    router.push("/chamados")
  }

  function handleVoltar() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/chamados")
    }
  }

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImagem(file)
  }

  if (sucesso) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-sm font-medium">Chamado criado com sucesso!</p>
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
        Voltar para chamados
      </button>

      <div>
        <h2 className="text-lg font-semibold">Novo chamado</h2>
        <p className="text-sm text-muted-foreground">Preencha as informações da solicitação</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="rounded-lg border bg-white p-6 space-y-5">
        {/* Título */}
        <Field label="Título" required error={errors.titulo}>
          <Input
            placeholder="Descreva brevemente o problema"
            value={values.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            data-error={errors.titulo ? true : undefined}
            className={cn(errors.titulo && "border-destructive focus-visible:ring-destructive")}
          />
        </Field>

        {/* Categoria + Prioridade */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoria" required error={errors.categoria}>
            <Select value={values.categoria} onValueChange={(v) => set("categoria", v)}>
              <SelectTrigger
                data-error={errors.categoria ? true : undefined}
                className={cn(errors.categoria && "border-destructive")}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ELETRICA">Elétrica</SelectItem>
                <SelectItem value="HIDRAULICA">Hidráulica</SelectItem>
                <SelectItem value="ESTRUTURA">Estrutura</SelectItem>
                <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                <SelectItem value="SEGURANCA">Segurança</SelectItem>
                <SelectItem value="OUTROS">Outros</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Prioridade" required error={errors.prioridade}>
            <Select value={values.prioridade} onValueChange={(v) => set("prioridade", v)}>
              <SelectTrigger
                data-error={errors.prioridade ? true : undefined}
                className={cn(errors.prioridade && "border-destructive")}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAIXA">Baixa</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Unidade */}
        <Field label="Unidade" required error={errors.unidade} hint="Ex: 301, Área Comum, Garagem">
          <Input
            placeholder="Número da unidade ou local"
            value={values.unidade}
            onChange={(e) => set("unidade", e.target.value)}
            data-error={errors.unidade ? true : undefined}
            className={cn(errors.unidade && "border-destructive focus-visible:ring-destructive")}
          />
        </Field>

        {/* Descrição */}
        <Field label="Descrição" required error={errors.descricao}>
          <Textarea
            placeholder="Descreva o problema com detalhes: quando começou, onde está localizado, o que já foi tentado..."
            value={values.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            data-error={errors.descricao ? true : undefined}
            rows={4}
            className={cn(
              "resize-none",
              errors.descricao && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </Field>

        {/* Upload de imagem */}
        <Field label="Imagem" hint="Opcional — foto do problema (JPG, PNG, até 10MB)">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleArquivo}
          />
          {imagem ? (
            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate text-muted-foreground">{imagem.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  ({(imagem.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImagem(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                className="ml-2 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              <Upload className="h-4 w-4" />
              Clique para anexar uma imagem
            </button>
          )}
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
                Criando...
              </>
            ) : (
              "Criar chamado"
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
