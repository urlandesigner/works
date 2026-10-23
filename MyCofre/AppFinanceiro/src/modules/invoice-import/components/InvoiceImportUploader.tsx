import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'

interface InvoiceImportUploaderProps {
  processing: boolean
  onSelectFile: (file: File) => void
}

export function InvoiceImportUploader({
  processing,
  onSelectFile,
}: InvoiceImportUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Card>
      <h2 className="card-block-heading">Upload da fatura (PDF)</h2>
      <p className="card-prose mb-4">
        O arquivo e processado apenas no seu navegador. Nada e enviado a servidores.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) onSelectFile(file)
        }}
        className="hidden"
        aria-hidden
      />
      <Button
        type="button"
        loading={processing}
        onClick={() => inputRef.current?.click()}
      >
        {!processing ? <Upload className="h-4 w-4" /> : null}
        {processing ? 'Lendo PDF...' : 'Selecionar PDF da fatura'}
      </Button>
    </Card>
  )
}
