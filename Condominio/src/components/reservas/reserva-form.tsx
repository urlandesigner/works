"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { adicionarReserva, areasMock } from "@/lib/mock/reservas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"

type FormValues = {
  areaId: string
  data: string
  horaInicio: string
  horaFim: string
  unidade: string
  nomeRes: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const initial: FormValues = {
  areaId: "",
  data: "",
  horaInicio: "",
  horaFim: "",
  unidade: "",
  nomeRes: "",
}

export function ReservaForm() {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>(initial)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function set<K extends keyof FormValues>(field: K, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      const next = { ...errors }
      delete next[field]
      setErrors(next)
    }
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!values.areaId) errs.areaId = "Selecione uma área."
    if (!values.data) errs.data = "Data é obrigatória."
    if (!values.horaInicio) errs.horaInicio = "Hora de início é obrigatória."
    if (!values.horaFim) errs.horaFim = "Hora de término é obrigatória."
    if (values.horaInicio && values.horaFim && values.horaFim <= values.horaInicio) {
      errs.horaFim = "O término deve ser após o início."
    }
    if (!values.unidade.trim()) errs.unidade = "Unidade é obrigatória."
    if (!values.nomeRes.trim()) errs.nomeRes = "Nome do responsável é obrigatório."
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

    adicionarReserva({
      areaId: values.areaId,
      data: values.data,
      horaInicio: values.horaInicio,
      horaFim: values.horaFim,
      unidade: values.unidade.trim(),
      nomeRes: values.nomeRes.trim(),
    })

    setLoading(false)
    setSucesso(true)
    await new Promise((res) => setTimeout(res, 1200))
    router.push("/reservas")
  }

  function handleVoltar() {
    if (window.history.length > 1) router.back()
    else router.push("/reservas")
  }

  if (sucesso) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-sm font-medium">Reserva confirmada com sucesso!</p>
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
        Voltar para reservas
      </button>

      <div>
        <h2 className="text-lg font-semibold">Nova reserva</h2>
        <p className="text-sm text-muted-foreground">Agende uma área comum do condomínio</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="rounded-lg border bg-white p-6 space-y-5">
        {/* Área */}
        <Field label="Área comum" required error={errors.areaId}>
          <Select value={values.areaId} onValueChange={(v) => v && set("areaId", v)}>
            <SelectTrigger className={cn(errors.areaId && "border-destructive")}>
              <SelectValue placeholder="Selecione a área" />
            </SelectTrigger>
            <SelectContent>
              {areasMock.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  <span>{a.nome}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    até {a.capacidade} pessoas
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Data */}
        <Field label="Data" required error={errors.data}>
          <Input
            type="date"
            value={values.data}
            onChange={(e) => set("data", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className={cn(errors.data && "border-destructive focus-visible:ring-destructive")}
          />
        </Field>

        {/* Horários */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Início" required error={errors.horaInicio}>
            <Input
              type="time"
              value={values.horaInicio}
              onChange={(e) => set("horaInicio", e.target.value)}
              className={cn(errors.horaInicio && "border-destructive focus-visible:ring-destructive")}
            />
          </Field>
          <Field label="Término" required error={errors.horaFim}>
            <Input
              type="time"
              value={values.horaFim}
              onChange={(e) => set("horaFim", e.target.value)}
              className={cn(errors.horaFim && "border-destructive focus-visible:ring-destructive")}
            />
          </Field>
        </div>

        {/* Unidade + Responsável */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Unidade" required error={errors.unidade} hint="Ex: 301, 12B">
            <Input
              placeholder="Número da unidade"
              value={values.unidade}
              onChange={(e) => set("unidade", e.target.value)}
              className={cn(errors.unidade && "border-destructive focus-visible:ring-destructive")}
            />
          </Field>
          <Field label="Responsável" required error={errors.nomeRes}>
            <Input
              placeholder="Nome completo"
              value={values.nomeRes}
              onChange={(e) => set("nomeRes", e.target.value)}
              className={cn(errors.nomeRes && "border-destructive focus-visible:ring-destructive")}
            />
          </Field>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={handleVoltar} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="gap-2 min-w-36">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              "Confirmar reserva"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label, required, hint, error, children,
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
