// Exemplos de uso do toast.promise para operações assíncronas
// Este arquivo serve como referência para implementar toast.promise em outros componentes

import { toast } from "sonner"

/**
 * Exemplo 1: Operação de salvamento com promise
 */
export const saveDataWithToast = async (data: any) => {
  const saveOperation = async () => {
    const response = await fetch('/api/some-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro na operação')
    }

    return response.json()
  }

  return toast.promise(saveOperation(), {
    loading: "Salvando...",
    success: "Dados salvos com sucesso!",
    error: (error) => `Erro: ${error.message}`
  })
}

/**
 * Exemplo 2: Upload de arquivo
 */
export const uploadFileWithToast = async (file: File) => {
  const uploadOperation = async () => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Falha no upload')
    }

    return response.json()
  }

  return toast.promise(uploadOperation(), {
    loading: "Enviando arquivo...",
    success: "Arquivo enviado com sucesso!",
    error: "Erro ao enviar arquivo"
  })
}

/**
 * Exemplo 3: Operação de exclusão com confirmação
 */
export const deleteItemWithToast = async (id: string) => {
  const deleteOperation = async () => {
    const response = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Erro ao excluir item')
    }
  }

  return toast.promise(deleteOperation(), {
    loading: "Excluindo...",
    success: "Item excluído com sucesso!",
    error: "Erro ao excluir item"
  })
}

/**
 * Exemplo 4: Múltiplas operações sequenciais
 */
export const complexOperationWithToast = async (data: any) => {
  const operation = async () => {
    // Passo 1: Validar dados
    if (!data.name) throw new Error('Nome é obrigatório')

    // Passo 2: Salvar dados
    const saveResponse = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!saveResponse.ok) throw new Error('Erro ao salvar')

    // Passo 3: Enviar notificação
    const notifyResponse = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Dados salvos' }),
    })

    if (!notifyResponse.ok) throw new Error('Erro na notificação')

    return saveResponse.json()
  }

  return toast.promise(operation(), {
    loading: "Processando dados...",
    success: "Operação concluída com sucesso!",
    error: (error) => `Falha: ${error.message}`
  })
}

