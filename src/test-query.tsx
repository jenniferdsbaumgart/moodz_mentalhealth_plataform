// Arquivo temporário para testar se QueryProvider funciona
"use client"

import { useQuery } from "@tanstack/react-query"

export function TestQuery() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["test"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { message: "QueryProvider funcionando!" }
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data?.message}</div>
}


