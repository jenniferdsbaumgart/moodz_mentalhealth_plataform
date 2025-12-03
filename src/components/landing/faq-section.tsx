"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "O que é o Moodz?",
    answer: "O Moodz é uma plataforma de saúde mental que conecta pessoas através de terapia em grupo, comunidade de apoio e ferramentas de bem-estar. Nosso objetivo é democratizar o acesso à saúde mental.",
  },
  {
    question: "As sessões de grupo são sigilosas?",
    answer: "Sim, absolutamente. A privacidade e o sigilo são fundamentais no Moodz. Todos os participantes concordam com termos de confidencialidade e as sessões não são gravadas.",
  },
  {
    question: "Preciso pagar para usar o Moodz?",
    answer: "Oferecemos um plano gratuito que dá acesso à comunidade e algumas ferramentas básicas. Para acesso ilimitado a grupos e recursos avançados, temos o plano Premium.",
  },
  {
    question: "Os terapeutas são qualificados?",
    answer: "Sim, todos os terapeutas que moderam grupos no Moodz passam por um rigoroso processo de verificação de credenciais e experiência profissional.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura Premium a qualquer momento sem multas ou taxas adicionais.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Tire suas dúvidas sobre o funcionamento da plataforma.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border rounded-lg bg-background overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full p-4 text-left font-medium transition-colors hover:bg-muted/50"
              >
                <span>{faq.question}</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`} 
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-4 text-muted-foreground text-sm">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

