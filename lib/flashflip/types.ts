export type Card = { id: string; term: string; definition: string }

export type Round = {
  order: string[]
  index: number
  results: Record<string, 'knew' | 'missed'>
}

export type View = 'paste' | 'quiz' | 'score'

export type AppState = { deck: Card[] | null; round: Round | null; view: View }
