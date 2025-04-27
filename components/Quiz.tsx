'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import questions from './questions'
import Image from "next/image"
import sosa from "../public/assets/sosal.png"
import Results from './Results'
import Lse from "../public/assets/lse.jpeg"

const Quiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState<number>(0)
  const [showScore, setShowScore] = useState(false)
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null))
  const { toast } = useToast()
  const { data: session } = useSession()

  const fetchUserScore = useCallback(async (email: string) => {
    try {
      const response = await fetch(`/api/score?email=${encodeURIComponent(email)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user score')
      }

      const data = await response.json()

      if (data.success) {
        if (data.userData?.score !== null) {
          const score = Math.min(data.userData.score, questions.length)
          if (score >= 7) {
            setScore(score)
            setShowScore(true)
          } else {
            setScore(score)
            setShowScore(false)
            toast({
              title: "Score insuffisant",
              description: `Votre score est ${score}, vous devez repasser l&apos;examen.`,
              variant: "default",
            })
          }
        } else {
          setScore(0)
          setShowScore(false)
          toast({
            title: "Premier examen",
            description: "Bonne chance pour votre examen !",
            variant: "default",
          })
        }
      } else {
        console.log(data.message || "Erreur inconnue")
        toast({
          title: "Message",
          description: data.message || "Impossible de récupérer le score",
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer le score",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserScore(session.user.email)
    }
  }, [session, fetchUserScore])

  const handleAnswerOptionClick = (answerIndex: number) => {
    const newUserAnswers = [...userAnswers]
    const previousAnswer = newUserAnswers[currentQuestion]
    
    newUserAnswers[currentQuestion] = answerIndex
    setUserAnswers(newUserAnswers)

    const isCorrect = questions[currentQuestion].answerOptions[answerIndex].isCorrect
    const wasCorrect = previousAnswer !== null && 
                      questions[currentQuestion].answerOptions[previousAnswer].isCorrect

    setScore(prevScore => {
      if (isCorrect && !wasCorrect) {
        return prevScore + 1
      } else if (!isCorrect && wasCorrect) {
        return prevScore - 1
      }
      return prevScore
    })
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowScore(true)
      sendScoreToDatabase()
    }
  }

  const sendScoreToDatabase = async () => {
    if (!session?.user?.email) return

    try {
      const finalScore = Math.min(score, questions.length)
      
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          score: finalScore
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save score')
      }

      const data = await response.json()
      console.log('Score saved:', data)
      toast({
        title: "Score enregistré",
        description: "Votre score a été enregistré avec succès.",
      })
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: "Erreur",
        description: "Impossible d&apos;enregistrer votre score",
        variant: "destructive",
      })
    }
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowScore(false)
    setUserAnswers(new Array(questions.length).fill(null))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white-500 p-4">
      <div className="flex justify-center gap-8 mb-8 w-full max-w-7xl">
        <Image src={Lse} alt="Logo" width={80} height={60} />
        <Image src={sosa} alt="Logo" width={150} height={60} />
      </div>

      <Card className="w-full max-w-7xl bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">
            Quiz sur l&apos;éthique et la lutte contre la corruption
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showScore ? (
            <Results score={Math.min(score, questions.length)} totalQuestions={questions.length} onRestart={restartQuiz} />
          ) : (
            <>
              <Progress value={(currentQuestion + 1) / questions.length * 100} className="mb-4 bg-gray-200" />
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  Question {currentQuestion + 1}/{questions.length}
                </h2>
                <p className="text-lg">{questions[currentQuestion].question}</p>
              </div>
              <div className="space-y-2">
                {questions[currentQuestion].answerOptions.map((answerOption, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerOptionClick(index)}
                    variant={userAnswers[currentQuestion] === index ? "default" : "outline"}
                    className={`w-full justify-start h-auto py-3 px-4 text-left 
                      whitespace-normal min-h-[80px] break-words ${
                        userAnswers[currentQuestion] === index
                          ? 'bg-blue-500 text-white-500 hover:bg-blue-600'
                          : 'bg-white text-black hover:bg-blue-100'
                      }`}
                  >
                    {answerOption.answer}
                  </Button>
                ))}
              </div>
            </>
          )}
        </CardContent>
        {!showScore && (
          <CardFooter className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="bg-white text-black hover:bg-blue-100"
            >
              Précédent
            </Button>
            <Button 
              onClick={handleNext}
              className="bg-blue-500 text-white-500 hover:bg-blue-600"
              disabled={userAnswers[currentQuestion] === null}
            >
              {currentQuestion === questions.length - 1 ? 'Terminé' : 'Suivant'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

export default Quiz