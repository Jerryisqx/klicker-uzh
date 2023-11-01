import {
  Element,
  ElementDisplayMode,
  ElementStackType,
  ElementType,
  QuestionInstance,
  SessionBlockStatus,
} from '@klicker-uzh/prisma'

// ----- AVATAR SETTINGS -----
// #region
export type AvatarSettings = {
  skinTone: string
  eyes: string
  mouth: string
  hair: string
  accessory: string
  hairColor: string
  clothing: string
  clothingColor: string
  facialHair: string
}

declare global {
  namespace PrismaJson {
    type PrismaAvatarSettings = AvatarSettings
  }
}
// #endregion

// ----- ELEMENT DATA AND INSTANCES -----
// #region
export type QuestionResponseChoices = {
  choices: number[]
}

export type QuestionResponseValue = {
  value: string
}

export enum Correctness {
  WRONG = 0,
  PARTIAL = 1,
  CORRECT = 2,
}

export type AggregatedResponseFlashcard = {
  [Correctness.WRONG]: number
  [Correctness.PARTIAL]: number
  [Correctness.CORRECT]: number
  total: number
}

export type AggregatedResponse = AggregatedResponseFlashcard

export type QuestionResponseFlashcard = {
  correctness: Correctness
}

export type QuestionResponse =
  | QuestionResponseChoices
  | QuestionResponseValue
  | QuestionResponseFlashcard

// TODO: results should also include the participants count (instead of storing it on the top-level)
export type QuestionResultsChoices = {
  choices: Record<string, number>
}

// TODO: to be consistent with choices results, the real results should be nested inside an e.g., values object, and participants should be included as a property
export type QuestionResultsOpen = {
  [x: string]: {
    count: number
    value: string
    correct?: boolean
  }
}

export type QuestionResults = QuestionResultsChoices | QuestionResultsOpen

export type Choice = {
  ix: number
  value: string
  correct?: boolean
  feedback?: string
}

interface BaseElementOptions {
  hasSampleSolution?: boolean
  hasAnswerFeedbacks?: boolean
}

export interface ElementOptionsChoices extends BaseElementOptions {
  choices: Choice[]
  displayMode: ElementDisplayMode
}

export interface ElementOptionsNumerical extends BaseElementOptions {
  unit?: string | null
  accuracy?: number
  placeholder?: string
  restrictions?: {
    min?: number
    max?: number
  }
  solutionRanges?: {
    min?: number | null
    max?: number | null
  }[]
}

export interface ElementOptionsFreeText extends BaseElementOptions {
  solutions?: string[]
  restrictions?: {
    maxLength?: number | null
  }
}

export type ElementOptions =
  | ElementOptionsChoices
  | ElementOptionsNumerical
  | ElementOptionsFreeText

export interface BaseElementData {
  type: ElementType

  id: number
  name: string
  content: string
  pointsMultiplier: number
  explanation?: string | null

  options: object

  // TODO: these legacy props have been moved to options
  displayMode: ElementDisplayMode
  hasSampleSolution: boolean
  hasAnswerFeedbacks: boolean
}

export type BaseElementDataKeys = (keyof BaseElementData)[]

interface IElementData<Type extends ElementType, Options extends ElementOptions>
  extends Element {
  type: Type
  options: Options
}

// export type FlashcardElementData = IElementData<'FLASHCARD', null>

export type ChoicesElementData = IElementData<
  'SC' | 'MC' | 'KPRIM',
  ElementOptionsChoices
>
export type FreeTextElementData = IElementData<
  'FREE_TEXT',
  ElementOptionsFreeText
>
export type NumericalElementData = IElementData<
  'NUMERICAL',
  ElementOptionsNumerical
>

export type AllElementTypeData =
  | ChoicesElementData
  | FreeTextElementData
  | NumericalElementData
// | FlashcardElementData

export interface IQuestionInstanceWithResults<
  Type extends ElementType,
  Results extends QuestionResults
> extends QuestionInstance {
  elementType?: Type
  questionData: AllElementTypeData
  results: Results
  statistics?: {
    max?: number
    mean?: number
    median?: number
    min?: number
    q1?: number
    q3?: number
    sd?: number[]
  }
}

export type ChoicesQuestionInstanceData = IQuestionInstanceWithResults<
  'SC' | 'MC' | 'KPRIM',
  QuestionResultsChoices
>
export type OpenQuestionInstanceData = IQuestionInstanceWithResults<
  'FREE_TEXT' | 'NUMERICAL',
  QuestionResultsOpen
>

export type AllQuestionInstanceTypeData =
  | ChoicesQuestionInstanceData
  | OpenQuestionInstanceData

export type FlashcardInstanceResults = {
  [Correctness.WRONG]: number
  [Correctness.PARTIAL]: number
  [Correctness.CORRECT]: number
  total: number
}

export type ElementInstanceResults = FlashcardInstanceResults

declare global {
  namespace PrismaJson {
    type PrismaQuestionResponse = QuestionResponse
    type PrismaElementOptions = ElementOptions
    type PrismaQuestionResults = QuestionResults
    type PrismaElementData = AllElementTypeData
    type PrismaElementInstanceResults = ElementInstanceResults
    type PrismaAggregatedResponse = AggregatedResponse
  }
}
// #endregion

// ----- ELEMENT STACKS -----
// #region
export type LiveQuizStackOptions = {
  timeLimit?: number
  expiresAt?: Date
  randomSelection?: number
  // TODO: by moving it here, we lose the default value, so ensure it is set in backend code correctly
  execution: number
  // TODO: rename the enum for consistency
  status: SessionBlockStatus
}

export type MicrolearningStackOptions = {}

export type PracticeQuizStackOptions = {}

export type ElementStackOptions =
  | LiveQuizStackOptions
  | MicrolearningStackOptions
  | PracticeQuizStackOptions

interface IElementStackOptions<
  Type extends ElementStackType,
  Options extends ElementStackOptions | null
> {}

export type AllElementStackOptions =
  | IElementStackOptions<'LIVE_QUIZ', LiveQuizStackOptions>
  | IElementStackOptions<'PRACTICE_QUIZ', PracticeQuizStackOptions>
  | IElementStackOptions<'MICROLEARNING', MicrolearningStackOptions>
  | IElementStackOptions<'GROUP_ACTIVITY', null>

declare global {
  namespace PrismaJson {
    type PrismaElementStackOptions = ElementStackOptions
  }
}
// #endregion