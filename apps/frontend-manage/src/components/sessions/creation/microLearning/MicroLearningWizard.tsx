import { useMutation } from '@apollo/client'
import {
  CreateMicroLearningDocument,
  EditMicroLearningDocument,
  Element,
  ElementType,
  MicroLearning,
} from '@klicker-uzh/graphql/dist/ops'
import dayjs from 'dayjs'
import { FormikProps } from 'formik'
import { findIndex } from 'lodash'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'
import * as yup from 'yup'
import ElementCreationErrorToast from '../../../toasts/ElementCreationErrorToast'
import CompletionStep from '../CompletionStep'
import StackCreationStep from '../StackCreationStep'
import WizardLayout, {
  ElementStackFormValues,
  MicroLearningFormValues,
} from '../WizardLayout'
import { ElementSelectCourse } from './../ElementCreation'
import MicroLearningDescriptionStep from './MicroLearningDescriptionStep'
import MicroLearningInformationStep from './MicroLearningInformationStep'
import MicroLearningSettingsStep from './MicroLearningSettingsStep'
import submitMicrolearningForm from './submitMicrolearningForm'

export interface MicroLearningWizardStepProps {
  editMode: boolean
  formRef: any
  formData: MicroLearningFormValues
  continueDisabled: boolean
  activeStep: number
  stepValidity: boolean[]
  validationSchema: any
  gamifiedCourses?: ElementSelectCourse[]
  nonGamifiedCourses?: ElementSelectCourse[]
  onSubmit?: (newValues: MicroLearningFormValues) => void
  setStepValidity: Dispatch<SetStateAction<boolean[]>>
  onPrevStep?: (newValues: MicroLearningFormValues) => void
  onNextStep?: (newValues: MicroLearningFormValues) => void
  closeWizard: () => void
}

// TODO: add free text questions to accepted types?
const acceptedTypes = [
  ElementType.Sc,
  ElementType.Mc,
  ElementType.Kprim,
  ElementType.Numerical,
  ElementType.Flashcard,
  ElementType.Content,
]

interface MicroLearningWizardProps {
  title: string
  gamifiedCourses: ElementSelectCourse[]
  nonGamifiedCourses: ElementSelectCourse[]
  initialValues?: MicroLearning
  selection: Record<number, Element>
  resetSelection: () => void
  closeWizard: () => void
  editMode: boolean
}

function MicroLearningWizard({
  title,
  gamifiedCourses,
  nonGamifiedCourses,
  initialValues,
  selection,
  resetSelection,
  closeWizard,
  editMode,
}: MicroLearningWizardProps) {
  const router = useRouter()
  const t = useTranslations()

  const [errorToastOpen, setErrorToastOpen] = useState(false)
  const [isWizardCompleted, setIsWizardCompleted] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(
    undefined
  )
  const [activeStep, setActiveStep] = useState(0)
  const [stepValidity, setStepValidity] = useState(
    Array(4).fill(!!initialValues)
  )
  const formRef = useRef<FormikProps<MicroLearningFormValues>>(null)

  const nameValidationSchema = yup.object().shape({
    name: yup.string().required(t('manage.sessionForms.sessionName')),
  })

  const descriptionValidationSchema = yup.object().shape({
    displayName: yup
      .string()
      .required(t('manage.sessionForms.sessionDisplayName')),
    description: yup.string(),
  })

  const settingsValidationSchema = yup.object().shape({
    startDate: yup.date().required(t('manage.sessionForms.startDate')),
    endDate: yup
      .date()
      .min(yup.ref('startDate'), t('manage.sessionForms.endAfterStart'))
      .required(t('manage.sessionForms.endDate')),
    multiplier: yup
      .string()
      .matches(/^[0-9]+$/, t('manage.sessionForms.validMultiplicator')),
    courseId: yup
      .string()
      .required(t('manage.sessionForms.microlearningCourse')),
  })

  const stackValiationSchema = yup.object().shape({
    stacks: yup
      .array()
      .of(
        yup.object().shape({
          displayName: yup.string(),
          description: yup.string(),
          elementIds: yup
            .array()
            .of(yup.number())
            .min(1, t('manage.sessionForms.minOneElementPerStack')),
          titles: yup.array().of(yup.string()),
          types: yup
            .array()
            .of(
              yup
                .string()
                .oneOf(
                  acceptedTypes,
                  t('manage.sessionForms.microlearningTypes')
                )
            ),
          hasSampleSolutions: yup
            .array()
            .of(
              yup.boolean().isTrue(t('manage.sessionForms.elementSolutionReq'))
            ),
        })
      )
      .min(1),
  })

  const formDefaultValues = {
    name: '',
    displayName: '',
    description: '',
    stacks: [
      {
        displayName: '',
        description: '',
        elementIds: [],
        titles: [],
        types: [],
        hasSampleSolutions: [],
      },
    ],
    startDate: dayjs().format('YYYY-MM-DDTHH:mm'),
    endDate: dayjs().add(1, 'days').format('YYYY-MM-DDTHH:mm'),
    multiplier: '1',
    courseId: undefined,
  }

  const workflowItems = [
    {
      title: t('shared.generic.information'),
      tooltip: t('manage.sessionForms.microLearningInformation'),
    },
    {
      title: t('shared.generic.description'),
      tooltip: t('manage.sessionForms.microlearningDescription'),
      tooltipDisabled: t('manage.sessionForms.microlearningDescription'),
    },
    {
      title: t('shared.generic.settings'),
      tooltip: t('manage.sessionForms.microlearningSettings'),
      tooltipDisabled: t('manage.sessionForms.checkValues'),
    },
    {
      title: t('shared.generic.questions'),
      tooltip: t('manage.sessionForms.microlearningQuestions'),
      tooltipDisabled: t('manage.sessionForms.checkValues'),
    },
  ]

  const [formData, setFormData] = useState<MicroLearningFormValues>({
    name: initialValues?.name || formDefaultValues.name,
    displayName: initialValues?.displayName || formDefaultValues.displayName,
    description: initialValues?.description || formDefaultValues.description,
    stacks: initialValues?.stacks
      ? initialValues.stacks.map((stack) => {
          return {
            displayName: stack.displayName ?? '',
            description: stack.description ?? '',
            ...stack.elements!.reduce(
              (acc: ElementStackFormValues, element) => {
                acc.elementIds.push(parseInt(element.elementData.id))
                acc.titles.push(element.elementData.name)
                acc.types.push(element.elementData.type)
                acc.hasSampleSolutions.push(true) // TODO: get value from element instance
                return acc
              },
              {
                elementIds: [],
                titles: [],
                types: [],
                hasSampleSolutions: [],
              }
            ),
          }
        })
      : formDefaultValues.stacks,
    startDate: initialValues?.scheduledStartAt
      ? dayjs(initialValues?.scheduledStartAt)
          .local()
          .format('YYYY-MM-DDTHH:mm')
      : formDefaultValues.startDate,
    endDate: initialValues?.scheduledEndAt
      ? dayjs(initialValues?.scheduledEndAt).local().format('YYYY-MM-DDTHH:mm')
      : formDefaultValues.endDate,
    multiplier: initialValues?.pointsMultiplier
      ? String(initialValues?.pointsMultiplier)
      : formDefaultValues.multiplier,
    courseId: initialValues?.course?.id ?? formDefaultValues.courseId,
  })

  const [createMicroLearning] = useMutation(CreateMicroLearningDocument)
  const [editMicroLearning] = useMutation(EditMicroLearningDocument)
  const handleSubmit = useCallback(
    async (values: MicroLearningFormValues) => {
      submitMicrolearningForm({
        id: initialValues?.id,
        values,
        createMicroLearning,
        editMicroLearning,
        setSelectedCourseId,
        setIsWizardCompleted,
        setErrorToastOpen,
        editMode,
      })
    },
    [createMicroLearning, editMicroLearning, editMode, initialValues?.id]
  )

  return (
    <>
      <WizardLayout
        title={title}
        editMode={editMode}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        disabledFrom={findIndex(stepValidity, (valid) => !valid) + 1}
        workflowItems={workflowItems}
        isCompleted={isWizardCompleted}
        completionStep={
          <CompletionStep
            completionSuccessMessage={(elementName) => (
              <div>
                {editMode
                  ? t.rich('manage.sessionForms.microlearningCreated', {
                      b: (text) => <strong>{text}</strong>,
                      name: elementName,
                    })
                  : t.rich('manage.sessionForms.microlearningEdited', {
                      b: (text) => <strong>{text}</strong>,
                      name: elementName,
                    })}
              </div>
            )}
            name={formData.name}
            editMode={editMode}
            onViewElement={() => {
              router.push(`/courses/${selectedCourseId}?tab=microLearnings`)
            }}
            onRestartForm={() => {
              setIsWizardCompleted(false)
            }}
            resetForm={() => setFormData(formDefaultValues)}
            setStepNumber={setActiveStep}
            onCloseWizard={closeWizard}
          />
        }
        steps={[
          <MicroLearningInformationStep
            key="micro-learning-information-step"
            editMode={editMode}
            formRef={formRef}
            formData={formData}
            continueDisabled={
              gamifiedCourses?.length === 0 && nonGamifiedCourses?.length === 0
            }
            activeStep={activeStep}
            stepValidity={stepValidity}
            validationSchema={nameValidationSchema}
            gamifiedCourses={gamifiedCourses}
            nonGamifiedCourses={nonGamifiedCourses}
            setStepValidity={setStepValidity}
            onNextStep={(newValues: Partial<MicroLearningFormValues>) => {
              setFormData((prev) => ({ ...prev, ...newValues }))
              setActiveStep((currentStep) => currentStep + 1)
            }}
            closeWizard={closeWizard}
          />,
          <MicroLearningDescriptionStep
            key="micro-learning-description-step"
            editMode={editMode}
            formRef={formRef}
            formData={formData}
            continueDisabled={false}
            activeStep={activeStep}
            stepValidity={stepValidity}
            validationSchema={descriptionValidationSchema}
            setStepValidity={setStepValidity}
            onNextStep={(newValues: Partial<MicroLearningFormValues>) => {
              setFormData((prev) => ({ ...prev, ...newValues }))
              setActiveStep((currentStep) => currentStep + 1)
            }}
            onPrevStep={(newValues: Partial<MicroLearningFormValues>) => {
              setFormData((prev) => ({ ...prev, ...newValues }))
              setActiveStep((currentStep) => currentStep - 1)
            }}
            closeWizard={closeWizard}
          />,
          <MicroLearningSettingsStep
            key="micro-learning-settings-step"
            editMode={editMode}
            formRef={formRef}
            formData={formData}
            continueDisabled={false}
            activeStep={activeStep}
            stepValidity={stepValidity}
            validationSchema={settingsValidationSchema}
            gamifiedCourses={gamifiedCourses}
            nonGamifiedCourses={nonGamifiedCourses}
            setStepValidity={setStepValidity}
            onNextStep={(newValues: Partial<MicroLearningFormValues>) => {
              setFormData((prev) => ({ ...prev, ...newValues }))
              setActiveStep((currentStep) => currentStep + 1)
            }}
            onPrevStep={(newValues: Partial<MicroLearningFormValues>) => {
              setFormData((prev) => ({ ...prev, ...newValues }))
              setActiveStep((currentStep) => currentStep - 1)
            }}
            closeWizard={closeWizard}
          />,
          <StackCreationStep
            key="stack-creation-step"
            editMode={editMode}
            selection={selection}
            resetSelection={resetSelection}
            acceptedTypes={acceptedTypes}
            formRef={formRef}
            formData={formData}
            continueDisabled={false}
            activeStep={activeStep}
            stepValidity={stepValidity}
            validationSchema={stackValiationSchema}
            setStepValidity={setStepValidity}
            onPrevStep={(newValues: Partial<MicroLearningFormValues>) => {
              setFormData((prev) => ({ ...prev, ...newValues }))
              setActiveStep((currentStep) => currentStep - 1)
            }}
            onSubmit={(newValues: MicroLearningFormValues) =>
              handleSubmit({ ...formData, ...newValues })
            }
            closeWizard={closeWizard}
          />,
        ]}
        saveFormData={() => {
          setFormData((prev) => ({ ...prev, ...formRef.current?.values }))
        }}
      />
      <ElementCreationErrorToast
        open={errorToastOpen}
        setOpen={setErrorToastOpen}
        error={
          editMode
            ? t('manage.sessionForms.microlearningEditingFailed')
            : t('manage.sessionForms.microlearningCreationFailed')
        }
      />
    </>
  )
}

export default MicroLearningWizard
