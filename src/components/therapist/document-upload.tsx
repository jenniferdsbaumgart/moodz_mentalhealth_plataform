"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react"
import { TherapistProfile } from "@/types/user"

interface DocumentUploadProps {
  profile: TherapistProfile | null
  onSave: (data: any) => Promise<void>
  isSaving: boolean
}

interface UploadedDocument {
  id: string
  name: string
  type: string
  url: string
  uploadedAt: Date
  status: "uploading" | "success" | "error"
}

export function DocumentUpload({
  profile,
  onSave,
  isSaving,
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([
    // Mock documents - em produção, isso viria da API
    {
      id: "1",
      name: "CRP_Diploma.pdf",
      type: "application/pdf",
      url: "#",
      uploadedAt: new Date(),
      status: "success",
    },
  ])
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ]
    if (!allowedTypes.includes(file.type)) {
      alert("Tipo de arquivo não permitido. Use PDF, JPG ou PNG.")
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo 5MB.")
      return
    }

    const tempId = `temp-${Date.now()}`
    const newDocument: UploadedDocument = {
      id: tempId,
      name: file.name,
      type: file.type,
      url: "",
      uploadedAt: new Date(),
      status: "uploading",
    }

    setDocuments(prev => [...prev, newDocument])
    setUploadingDocument(tempId)

    try {
      // Simular upload - em produção, isso seria enviado para uma API
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "certificate")

      // Mock upload delay
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock success
      const mockUrl = `https://example.com/uploads/documents/${file.name}`
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === tempId
            ? { ...doc, url: mockUrl, status: "success" as const }
            : doc
        )
      )

      console.log("Documento uploaded:", mockUrl)
    } catch (error) {
      console.error("Erro no upload:", error)
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === tempId
            ? { ...doc, status: "error" as const }
            : doc
        )
      )
    } finally {
      setUploadingDocument(null)
    }
  }

  const removeDocument = async (documentId: string) => {
    // Em produção, isso chamaria uma API para deletar o documento
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return "🖼️"
    }
    return "📄"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Documentos
          </CardTitle>
          <CardDescription>
            Faça upload de certificados, diplomas e outros documentos relevantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Arraste e solte arquivos aqui, ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG até 5MB cada
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="document-upload"
                disabled={!!uploadingDocument}
              />
              <Label htmlFor="document-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  disabled={!!uploadingDocument}
                  asChild
                >
                  <span className="cursor-pointer">
                    {uploadingDocument ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Arquivo
                      </>
                    )}
                  </span>
                </Button>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Enviados ({documents.length})
          </CardTitle>
          <CardDescription>
            Lista de documentos enviados para verificação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum documento enviado ainda
            </p>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getFileIcon(document.type)}
                    </div>
                    <div>
                      <p className="font-medium">{document.name}</p>
                      <p className="text-sm text-gray-500">
                        Enviado em {document.uploadedAt.toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {document.status === "uploading" && (
                      <Badge variant="secondary">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Enviando
                      </Badge>
                    )}
                    {document.status === "success" && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aprovado
                      </Badge>
                    )}
                    {document.status === "error" && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Erro
                      </Badge>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(document.id)}
                      disabled={document.status === "uploading"}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Documentos obrigatórios:</strong> CRP válido e diploma de formação
            </p>
            <p>
              <strong>Verificação:</strong> Todos os documentos serão verificados pela nossa equipe
            </p>
            <p>
              <strong>Prazo:</strong> A verificação pode levar até 48 horas
            </p>
            <p>
              <strong>Segurança:</strong> Seus documentos são criptografados e armazenados com segurança
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
