import {
  faBookOpen,
  faLightbulb,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { FormikTextField, UserNotification } from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import { useTranslations } from 'next-intl'
import CreationFormValidator from '../CreationFormValidator'
import PropertyList from '../PropertyList'
import WizardNavigation from '../WizardNavigation'
import { MicroLearningWizardStepProps } from './MicroLearningWizard'

function MicroLearningInformationStep({
  editMode,
  formRef,
  formData,
  continueDisabled,
  activeStep,
  stepValidity,
  validationSchema,
  gamifiedCourses,
  nonGamifiedCourses,
  setStepValidity,
  onNextStep,
  closeWizard,
}: MicroLearningWizardStepProps) {
  const t = useTranslations()
  const noCourse =
    gamifiedCourses?.length === 0 && nonGamifiedCourses?.length === 0

  return (
    <Formik
      validateOnMount
      initialValues={formData}
      onSubmit={onNextStep!}
      innerRef={formRef}
      validationSchema={validationSchema}
    >
      {({ isValid, isSubmitting }) => (
        <Form className="h-full w-full">
          <CreationFormValidator
            isValid={isValid}
            activeStep={activeStep}
            setStepValidity={setStepValidity}
          />
          <div className="flex h-full w-full flex-col justify-between gap-1">
            <div className="flex flex-row">
              <div className="w-full md:w-1/2">
                {noCourse ? (
                  <UserNotification
                    type="error"
                    message={t('manage.sessionForms.microLearningNoCourse')}
                    className={{ root: 'mb-2' }}
                  />
                ) : (
                  <div className="w-full md:pr-14">
                    {t('manage.sessionForms.microLearningIntroductionName')}
                  </div>
                )}
                <FormikTextField
                  required
                  autoComplete="off"
                  name="name"
                  label={t('manage.sessionForms.name')}
                  tooltip={t('manage.sessionForms.microlearningName')}
                  className={{
                    root: 'mb-2 md:w-96',
                    tooltip: 'z-20',
                  }}
                  data-cy="insert-microlearning-name"
                />
              </div>
              <div className="border-uzh-grey-80 bg-uzh-grey-20 ml-1 hidden h-max w-1/2 flex-col gap-2 rounded-md border border-solid p-3 md:flex">
                <PropertyList
                  elements={[
                    {
                      icon: faLightbulb,
                      iconColor: 'text-orange-400',
                      richText: t.rich(
                        'manage.sessionForms.microlearningUseCase',
                        {
                          link: (text) => (
                            <a
                              href="https://www.klicker.uzh.ch/use_cases/microlearning/"
                              target="_blank"
                              className="underline"
                            >
                              {text}
                            </a>
                          ),
                        }
                      ),
                    },
                    {
                      icon: faBookOpen,
                      iconColor: 'text-uzh-blue-100',
                      richText: t.rich(
                        'manage.sessionForms.microLearningLecturerDocs',
                        {
                          link: (text) => (
                            <a
                              href="https://www.klicker.uzh.ch/tutorials/microlearning/"
                              target="_blank"
                              className="underline"
                            >
                              {text}
                            </a>
                          ),
                        }
                      ),
                    },
                    {
                      icon: faUsers,
                      iconColor: 'text-black',
                      richText: t.rich(
                        'manage.sessionForms.microLearningStudentDocs',
                        {
                          link: (text) => (
                            <a
                              href="https://www.klicker.uzh.ch/student_tutorials/microlearning/"
                              target="_blank"
                              className="underline"
                            >
                              {text}
                            </a>
                          ),
                        }
                      ),
                    },
                  ]}
                />
              </div>
            </div>
            <WizardNavigation
              editMode={editMode}
              isSubmitting={isSubmitting}
              stepValidity={stepValidity}
              activeStep={activeStep}
              lastStep={activeStep === stepValidity.length - 1}
              continueDisabled={continueDisabled}
              onCloseWizard={closeWizard}
            />
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default MicroLearningInformationStep
