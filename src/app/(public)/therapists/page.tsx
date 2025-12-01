"use client"

import { useState, useEffect } from "react"

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await fetch('/api/therapists')
        if (response.ok) {
          const data = await response.json()
          setTherapists(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching therapists:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTherapists()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Encontre seu Terapeuta
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conecte-se com profissionais qualificados e verificados para cuidar da sua saúde mental
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p>Carregando terapeutas...</p>
          </div>
        ) : therapists.length === 0 ? (
          <div className="text-center py-8">
            <p>Nenhum terapeuta encontrado</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {therapists.map((therapist: any) => (
              <div key={therapist.id} className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-bold text-lg mb-2">{therapist.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{therapist.bio}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-600 font-medium">
                    {therapist.availableForNew ? 'Disponível' : 'Lista de espera'}
                  </span>
                  <span className="font-bold text-gray-900">
                    R$ {therapist.sessionPrice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
