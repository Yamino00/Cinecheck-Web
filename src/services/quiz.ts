import { supabase } from '../lib/supabase'

export interface QuizQuestion {
  id: string
  content_id: string
  question: string
  correct_answer: string
  wrong_answers: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'plot' | 'cast' | 'trivia' | 'quotes' | 'production' | 'characters' | 'soundtrack'
  time_limit: number
  points: number
  hint?: string
  explanation?: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  content_id: string
  questions: Array<{
    question_id: string
    user_answer: string
    is_correct: boolean
    time_taken: number
    points_earned: number
  }>
  score: number
  max_score: number
  time_taken: number
  passed: boolean
  attempt_number: number
  created_at: string
}

export interface QuizSession {
  contentId: string
  contentTitle: string
  contentType: 'movie' | 'series' | 'anime'
  questions: QuizQuestion[]
  currentQuestionIndex: number
  answers: Map<string, string>
  startTime: Date
  timePerQuestion: Map<string, number>
  hintsUsed: Set<string>
  score: number
  maxScore: number
}

export interface QuizGeneratorOptions {
  contentId: string
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed'
  questionCount?: number
  categories?: string[]
  timeLimit?: number
}

export interface QuizResults {
  passed: boolean
  score: number
  maxScore: number
  percentage: number
  timeTaken: number
  correctAnswers: number
  totalQuestions: number
  pointsEarned: number
  bonusPoints: number
  achievements: string[]
  newReliabilityScore?: number
}

class QuizService {
  private readonly PASSING_THRESHOLD = 0.7 // 70% to pass
  private readonly BONUS_TIME_THRESHOLD = 15 // seconds per question for bonus
  private readonly HINT_PENALTY = 0.5 // 50% points reduction for using hint

  // Generate a quiz for a specific content
  async generateQuiz(options: QuizGeneratorOptions): Promise<QuizQuestion[]> {
    const {
      contentId,
      difficulty = 'mixed',
      questionCount = 10,
      categories,
      timeLimit = 30,
    } = options

    // Build query
    let query = supabase
      .from('quiz_questions')
      .select('*')
      .eq('content_id', contentId)

    // Apply difficulty filter
    if (difficulty !== 'mixed') {
      query = query.eq('difficulty', difficulty)
    }

    // Apply category filter
    if (categories && categories.length > 0) {
      query = query.in('category', categories)
    }

    const { data: questions, error } = await query

    if (error) throw error
    if (!questions || questions.length === 0) {
      throw new Error('No quiz questions available for this content')
    }

    // Shuffle and select questions
    const shuffled = this.shuffleArray(questions)
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length))

    // If not enough questions, generate some dynamic ones
    if (selected.length < questionCount) {
      const dynamicQuestions = await this.generateDynamicQuestions(
        contentId,
        questionCount - selected.length
      )
      // Cast esplicito per bypassare problemi di tipo
      ;(selected as any).push(...dynamicQuestions)
    }

    return selected.map((q: any) => ({
      ...q,
      time_limit: q.time_limit || timeLimit,
    }))
  }

  // Generate dynamic questions based on content data
  private async generateDynamicQuestions(
    contentId: string,
    count: number
  ): Promise<QuizQuestion[]> {
    // Get content details
    const { data: content, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', contentId)
      .single()

    if (error || !content) return []

    const questions: QuizQuestion[] = []
    const templates = this.getQuestionTemplates((content as any).type)

    for (let i = 0; i < Math.min(count, templates.length); i++) {
      const template = templates[i]
      const question = this.fillTemplate(template, content)
      if (question) questions.push(question)
    }

    return questions
  }

  // Question templates for dynamic generation
  private getQuestionTemplates(contentType: 'movie' | 'series' | 'anime') {
    const baseTemplates = [
      {
        category: 'plot',
        template: 'In quale anno è uscito questo {type}?',
        answerField: 'release_date',
        difficulty: 'easy',
      },
      {
        category: 'cast',
        template: 'Chi è il protagonista principale?',
        answerField: 'cast_members[0].name',
        difficulty: 'easy',
      },
      {
        category: 'production',
        template: 'Chi ha diretto questo {type}?',
        answerField: 'crew.director',
        difficulty: 'medium',
      },
      {
        category: 'trivia',
        template: 'Qual è il budget approssimativo?',
        answerField: 'budget',
        difficulty: 'hard',
      },
    ]

    if (contentType === 'series' || contentType === 'anime') {
      baseTemplates.push(
        {
          category: 'plot',
          template: 'Quante stagioni ha questa serie?',
          answerField: 'seasons_count',
          difficulty: 'easy',
        },
        {
          category: 'characters',
          template: 'Come si chiama il protagonista?',
          answerField: 'main_character',
          difficulty: 'easy',
        }
      )
    }

    return baseTemplates
  }

  // Fill a template with actual content data
  private fillTemplate(template: any, content: any): QuizQuestion | null {
    // This is a simplified version - in production would be more sophisticated
    const question: QuizQuestion = {
      id: `dynamic-${Date.now()}-${Math.random()}`,
      content_id: content.id,
      question: template.template.replace('{type}', content.type === 'movie' ? 'film' : 'serie'),
      correct_answer: this.extractAnswer(content, template.answerField),
      wrong_answers: this.generateWrongAnswers(template.answerField, content),
      difficulty: template.difficulty,
      category: template.category,
      time_limit: 30,
      points: template.difficulty === 'easy' ? 10 : template.difficulty === 'medium' ? 15 : 20,
    }

    if (!question.correct_answer || question.wrong_answers.length < 3) {
      return null
    }

    return question
  }

  // Extract answer from content based on field path
  private extractAnswer(content: any, fieldPath: string): string {
    const parts = fieldPath.split('.')
    let value = content

    for (const part of parts) {
      if (part.includes('[')) {
        const [field, index] = part.split('[')
        const idx = parseInt(index.replace(']', ''))
        value = value[field]?.[idx]
      } else {
        value = value[part]
      }
    }

    return String(value || '')
  }

  // Generate plausible wrong answers
  private generateWrongAnswers(answerType: string, content: any): string[] {
    // Simplified version - would be more sophisticated in production
    const wrongAnswers: string[] = []

    if (answerType.includes('date')) {
      const year = new Date(content.release_date).getFullYear()
      wrongAnswers.push(
        String(year - 1),
        String(year + 1),
        String(year - 2)
      )
    } else if (answerType.includes('budget')) {
      const budget = content.budget
      wrongAnswers.push(
        `$${(budget * 0.5).toLocaleString()}`,
        `$${(budget * 1.5).toLocaleString()}`,
        `$${(budget * 2).toLocaleString()}`
      )
    } else {
      // Generic wrong answers
      wrongAnswers.push('Opzione A', 'Opzione B', 'Opzione C')
    }

    return wrongAnswers.slice(0, 3)
  }

  // Submit quiz attempt
  async submitQuizAttempt(session: QuizSession, userId: string): Promise<QuizResults> {
    const endTime = new Date()
    const timeTaken = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000)

    // Calculate score
    let correctAnswers = 0
    let totalPoints = 0
    let maxPoints = 0
    const questionResults = []

    for (const question of session.questions) {
      const userAnswer = session.answers.get(question.id)
      const isCorrect = userAnswer === question.correct_answer
      const timeForQuestion = session.timePerQuestion.get(question.id) || question.time_limit
      const usedHint = session.hintsUsed.has(question.id)

      let pointsEarned = 0
      if (isCorrect) {
        correctAnswers++
        pointsEarned = question.points
        
        // Apply hint penalty
        if (usedHint) {
          pointsEarned *= (1 - this.HINT_PENALTY)
        }
        
        // Apply time bonus
        if (timeForQuestion < this.BONUS_TIME_THRESHOLD) {
          pointsEarned *= 1.2
        }
      }

      totalPoints += pointsEarned
      maxPoints += question.points

      questionResults.push({
        question_id: question.id,
        user_answer: userAnswer || '',
        is_correct: isCorrect,
        time_taken: timeForQuestion,
        points_earned: Math.floor(pointsEarned),
      })
    }

    const percentage = (correctAnswers / session.questions.length) * 100
    const passed = percentage >= (this.PASSING_THRESHOLD * 100)

    // Save attempt to database
    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        content_id: session.contentId,
        questions: questionResults as any,
        score: Math.floor(totalPoints),
        max_score: maxPoints,
        time_taken: timeTaken,
        passed,
        attempt_number: await this.getAttemptNumber(userId, session.contentId),
      } as any)
      .select()
      .single()

    if (error) throw error

    // Calculate achievements
    const achievements = this.calculateAchievements(percentage, timeTaken, session.questions.length)

    // Update user reliability score if passed
    let newReliabilityScore
    if (passed) {
      newReliabilityScore = await this.updateReliabilityScore(userId, percentage)
    }

    return {
      passed,
      score: Math.floor(totalPoints),
      maxScore: maxPoints,
      percentage,
      timeTaken,
      correctAnswers,
      totalQuestions: session.questions.length,
      pointsEarned: Math.floor(totalPoints),
      bonusPoints: Math.floor(totalPoints - (correctAnswers * 10)),
      achievements,
      newReliabilityScore,
    }
  }

  // Calculate achievements earned
  private calculateAchievements(percentage: number, timeTaken: number, questionCount: number): string[] {
    const achievements: string[] = []

    if (percentage === 100) {
      achievements.push('perfect_score')
    }
    if (percentage >= 90) {
      achievements.push('expert_viewer')
    }
    if (timeTaken / questionCount < 10) {
      achievements.push('speed_demon')
    }
    if (percentage >= 70 && timeTaken / questionCount < 15) {
      achievements.push('efficient_reviewer')
    }

    return achievements
  }

  // Update user reliability score
  private async updateReliabilityScore(userId: string, quizPercentage: number): Promise<number> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('quiz_success_rate, total_reviews, verified_reviews')
      .eq('id', userId)
      .single()

    if (error || !profile) return 0

    // Calculate new success rate (weighted average)
    const currentRate = (profile as any).quiz_success_rate || 0
    const totalAttempts = (profile as any).verified_reviews || 0
    const newRate = ((currentRate * totalAttempts) + quizPercentage) / (totalAttempts + 1)

    // Update profile - cast esplicito per bypassare problemi di tipo
    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update({
        quiz_success_rate: newRate,
        verified_reviews: totalAttempts + 1,
      })
      .eq('id', userId)

    if (updateError) throw updateError

    return newRate
  }

  // Get attempt number for user and content
  private async getAttemptNumber(userId: string, contentId: string): Promise<number> {
    const { count, error } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('content_id', contentId)

    if (error) return 1
    return (count || 0) + 1
  }

  // Shuffle array utility
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Get quiz statistics for a user
  async getUserQuizStats(userId: string) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const stats = {
      totalAttempts: data.length,
      passedAttempts: data.filter((a: any) => a.passed).length,
      averageScore: data.reduce((acc: number, a: any) => acc + (a.score / a.max_score) * 100, 0) / data.length,
      totalTimeTaken: data.reduce((acc: number, a: any) => acc + a.time_taken, 0),
      recentAttempts: data.slice(0, 5),
    }

    return stats
  }

  // Check if user can review content (has passed quiz)
  async canUserReview(userId: string, contentId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('passed')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('passed', true)
      .limit(1)

    if (error) return false
    return data.length > 0
  }
}

export const quizService = new QuizService()
export default quizService