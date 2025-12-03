import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db as prisma } from "@/lib/db"
// POST - Upload de documento
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    if (!file) {
      return NextResponse.json(
        { success: false, message: "Arquivo não fornecido" },
        { status: 400 }
      )
    }
    // Validar tipo de arquivo
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Tipo de arquivo não permitido. Use PDF, JPG ou PNG." },
        { status: 400 }
      )
    }
    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "Arquivo muito grande. Máximo 5MB." },
        { status: 400 }
      )
    }
    // Simular processamento do upload
    // Em produção, isso seria enviado para um serviço de storage como AWS S3, Cloudinary, etc.
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simular delay
    // Mock URL - em produção, isso seria a URL real do arquivo armazenado
    const fileUrl = `https://storage.example.com/therapists/${session.user.id}/documents/${Date.now()}-${file.name}`
    // Salvar referência no banco (opcional - dependendo da implementação)
    // Aqui poderíamos criar uma tabela para documentos dos terapeutas
    // Por enquanto, apenas retornamos sucesso
    return NextResponse.json({
      success: true,
      data: {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
        status: "uploaded",
      },
      message: "Documento enviado com sucesso",
    })
  } catch (error) {
    console.error("Erro no upload de documento:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
// GET - Listar documentos do terapeuta
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }
    // Mock data - em produção, isso viria do banco de dados
    const mockDocuments = [
      {
        id: "doc-1",
        name: "CRP_Diploma.pdf",
        type: "application/pdf",
        url: "https://storage.example.com/mock-document.pdf",
        uploadedAt: new Date().toISOString(),
        status: "approved",
        verifiedAt: new Date().toISOString(),
      },
    ]
    return NextResponse.json({
      success: true,
      data: mockDocuments,
    })
  } catch (error) {
    console.error("Erro ao listar documentos:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
// DELETE - Remover documento
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("id")
    if (!documentId) {
      return NextResponse.json(
        { success: false, message: "ID do documento não fornecido" },
        { status: 400 }
      )
    }
    // Mock delete - em produção, isso removeria do storage e banco
    await new Promise(resolve => setTimeout(resolve, 1000))
    return NextResponse.json({
      success: true,
      message: "Documento removido com sucesso",
    })
  } catch (error) {
    console.error("Erro ao remover documento:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
