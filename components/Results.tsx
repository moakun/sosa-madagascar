import React from 'react'
import Link from 'next/link'
import { Progress } from "@/components/ui/progress"

interface ResultsProps {
  score: number
  totalQuestions: number
  onRestart: () => void
}

const Results: React.FC<ResultsProps> = ({ score, totalQuestions, onRestart }) => {
  const percentage = (score / totalQuestions) * 100

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">Quiz terminé!</h2>
      <p className="text-2xl mb-4">
        Votre score est : {score} / {totalQuestions}
      </p>
      <Progress value={percentage} className="mb-4" />
      <div className="flex justify-center space-x-4 mt-6">
        {/* Redémarrer le quiz */}
        <button 
          onClick={onRestart} 
          className="px-4 py-2 bg-blue-500 text-white-500 rounded hover:bg-blue-600 transition-colors"
        >
          Redémarrer le quiz
        </button>

        {/* Lien vers le tableau de bord*/}
        <Link 
          href="/dashboard" 
          className="px-4 py-2 bg-blue-500 text-white-500 rounded hover:bg-blue-600 transition-colors"
        >
          Retour au tableau de bord
        </Link>

        {/* Lien vers le questionnaire */}
        <Link 
          href="/questionnaire" 
          className="px-4 py-2 bg-blue-500 text-white-500 rounded hover:bg-blue-600 transition-colors"
        >
          Aller au questionnaire
        </Link>
      </div>
    </div>
  )
}

export default Results