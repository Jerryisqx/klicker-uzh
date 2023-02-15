import { faEye } from '@fortawesome/free-regular-svg-icons'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Session } from '@klicker-uzh/graphql/dist/ops'
import { Button, Progress } from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import React, { useState } from 'react'

interface FormProps {
  isCompleted: boolean
  completionSuccessMessage?: (elementName: string) => React.ReactNode
  children: React.ReactNode[]
  initialValues?: Partial<Session>
  onSubmit: (values: any, bag: any) => void
  onViewElement: () => void
  onRestartForm: () => void
}

export interface LiveSessionFormValues {
  name: string
  displayName: string
  description: string
  blocks: {
    questionIds: number[]
    titles: string[]
    timeLimit: number
  }[]
  courseId: string
  multiplier: string
  isGamificationEnabled: boolean
}

export interface MicroSessionFormValues {
  name: string
  displayName: string
  description: string
  questions: {
    id: number
    title: string
    hasAnswerFeedbacks: boolean
    hasSampleSolution: boolean
  }[]
  startDate: string
  endDate: string
  multiplier: string
  courseId: string
}

export interface LearningElementFormValues {
  name: string
  displayName: string
  description: string
  questions: {
    id: number
    title: string
    hasAnswerFeedbacks: boolean
    hasSampleSolution: boolean
  }[]
  multiplier: string
  courseId: string
  order: any
  resetTimeDays: string
}

function MultistepWizard({
  children,
  initialValues,
  onSubmit,
  isCompleted,
  completionSuccessMessage,
  onViewElement,
  onRestartForm,
}: FormProps) {
  const [stepNumber, setStepNumber] = useState(0)

  const steps = React.Children.toArray(children)

  const [snapshot, setSnapshot] = useState(initialValues)

  const step = steps[stepNumber]
  const totalSteps = steps.length
  const isLastStep = stepNumber === totalSteps - 1

  const next = (
    values:
      | LiveSessionFormValues
      | MicroSessionFormValues
      | LearningElementFormValues
  ) => {
    setSnapshot(values)
    setStepNumber(Math.min(stepNumber + 1, totalSteps - 1))
  }

  const previous = (
    values:
      | LiveSessionFormValues
      | MicroSessionFormValues
      | LearningElementFormValues
  ) => {
    setSnapshot(values)
    setStepNumber(Math.max(stepNumber - 1, 0))
  }

  const handleSubmit = async (
    values:
      | LiveSessionFormValues
      | MicroSessionFormValues
      | LearningElementFormValues,
    bag: any
  ) => {
    console.log('handleSubmit - values: ', values)
    if (step.props.onSubmit) {
      await step.props.onSubmit(values, bag)
    }

    if (isLastStep) {
      return onSubmit(values, bag)
    } else {
      bag.setTouched({})
      next(values)
    }
  }

  return (
    <Formik
      initialValues={snapshot}
      onSubmit={handleSubmit}
      validationSchema={step.props.validationSchema}
      isInitialValid={false}
    >
      {({ values, isSubmitting, isValid, resetForm }) => (
        <Form className="flex flex-col gap-4 p-4">
          {!isCompleted && step}
          {isCompleted && (
            <div className="flex flex-col items-center gap-4 p-4">
              <div>
                {completionSuccessMessage
                  ? completionSuccessMessage(values.name)
                  : 'Element erfolgreich erstellt/modifiziert.'}
              </div>
              <div className="space-x-2">
                <Button onClick={onViewElement}>
                  <Button.Icon>
                    <FontAwesomeIcon icon={faEye} />
                  </Button.Icon>
                  <Button.Label>Übersicht öffnen</Button.Label>
                </Button>
                <Button
                  onClick={() => {
                    onRestartForm()
                    resetForm()
                    setStepNumber(0)
                  }}
                >
                  <Button.Icon>
                    <FontAwesomeIcon icon={faSync} />
                  </Button.Icon>
                  <Button.Label>Weiteres Element erstellen</Button.Label>
                </Button>
              </div>
            </div>
          )}
          {!isCompleted && (
            <div className="flex flex-row items-center justify-between gap-4">
              <div>
                <Button
                  disabled={stepNumber === 0}
                  onClick={() => previous(values)}
                  type="button"
                >
                  Zurück
                </Button>
              </div>

              <Progress
                className={{
                  root: 'flex-1 h-4 text-xs',
                  indicator: 'bg-slate-400 h-4 text-xs',
                }}
                value={stepNumber + 1}
                max={totalSteps}
                formatter={(step) => `Schritt ${step}`}
              />

              <div>
                <Button disabled={isSubmitting} type="submit">
                  {isLastStep ? 'Erstellen' : 'Weiter'}
                </Button>
              </div>
            </div>
          )}
        </Form>
      )}
    </Formik>
  )
}

export const WizardStep = ({ children }: any) => children

export default MultistepWizard
