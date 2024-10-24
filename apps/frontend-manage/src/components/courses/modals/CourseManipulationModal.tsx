import { Course } from '@klicker-uzh/graphql/dist/ops'
import {
  Button,
  FormikColorPicker,
  FormikDateChanger,
  FormikNumberField,
  FormikSwitchField,
  FormikTextField,
  H3,
  Modal,
  UserNotification,
} from '@uzh-bf/design-system'
import dayjs from 'dayjs'
import { Form, Formik, FormikProps } from 'formik'
import { useTranslations } from 'next-intl'
import { Dispatch, SetStateAction, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import * as yup from 'yup'
import EditorField from '../../sessions/creation/EditorField'
import ElementCreationErrorToast from '../../toasts/ElementCreationErrorToast'
import CourseDateChangeMonitor from './CourseDateChangeMonitor'
import GamificationSettingMonitor from './GamificationSettingMonitor'

interface CourseManipulationModalProps {
  initialValues?: Course
  modalOpen: boolean
  earliestGroupDeadline?: string
  earliestStartDate?: string
  latestEndDate?: string
  onModalClose: () => void
  onSubmit: (
    values: CourseManipulationFormData,
    setSubmitting: (isSubmitting: boolean) => void,
    setShowErrorToast: Dispatch<SetStateAction<boolean>>
  ) => Promise<void>
}

export interface CourseManipulationFormData {
  name: string
  displayName: string
  description: string
  color: string
  startDate: string
  endDate: string
  isGamificationEnabled: boolean
  isGroupCreationEnabled: boolean
  groupCreationDeadline: string
  maxGroupSize?: number
  preferredGroupSize?: number
}

function CourseManipulationModal({
  initialValues,
  modalOpen,
  earliestGroupDeadline,
  earliestStartDate,
  latestEndDate,
  onModalClose,
  onSubmit,
}: CourseManipulationModalProps) {
  const t = useTranslations()
  const [showErrorToast, setShowErrorToast] = useState(false)
  const formRef = useRef<FormikProps<CourseManipulationFormData>>(null)

  // check if initialValues.startDate is in the past
  const startDatePast =
    initialValues?.startDate && new Date(initialValues.startDate) < new Date()
  const endDatePast =
    initialValues?.endDate && new Date(initialValues.endDate) < new Date()

  const schema = yup.object().shape({
    name: yup.string().required(t('manage.courseList.courseNameReq')),
    displayName: yup
      .string()
      .required(t('manage.courseList.courseDisplayNameReq')),
    description: yup.string(),
    color: yup.string().required(t('manage.courseList.courseColorReq')),
    startDate: yup
      .date()
      .required(t('manage.courseList.courseStartReq'))
      .test(
        'afterEarliestActivityStart',
        t('manage.courseList.courseStartBeforeEarliestActivityStart', {
          date: dayjs(earliestStartDate).format('DD.MM.YYYY'),
        }),
        (date) => {
          return earliestStartDate
            ? dayjs(date).isBefore(dayjs(earliestStartDate))
            : true
        }
      ),
    endDate: endDatePast
      ? yup.date()
      : yup
          .date()
          .test(
            'checkDateInPast',
            t('manage.courseList.endDateFuture'),
            (d) => {
              return !!(d && d > new Date())
            }
          )
          .test(
            'beforeEarliestActivityEnd',
            t('manage.courseList.endBeforeEarliestActivityEnd', {
              date: dayjs(latestEndDate).format('DD.MM.YYYY'),
            }),
            (date) => {
              return latestEndDate
                ? dayjs(date).isAfter(dayjs(latestEndDate))
                : true
            }
          )
          .when('startDate', (startDate, schema) =>
            schema.min(startDate, t('manage.courseList.endAfterStart'))
          )
          .required(t('manage.courseList.courseEndReq')),
    isGamificationEnabled: yup.boolean(),
    isGroupCreationEnabled: yup.boolean(),
    groupCreationDeadline: initialValues?.groupDeadlineDate
      ? yup
          .date()
          .required(t('manage.courseList.groupDeadlineReq'))
          .min(
            yup.ref('startDate'),
            t('manage.courseList.groupDeadlineAfterStart')
          )
          .max(
            yup.ref('endDate'),
            t('manage.courseList.groupDeadlineBeforeEnd')
          )
          .test(
            'isBeforeFirstGroupActivity',
            t('manage.courseList.groupDeadlineBeforeFirstGroupActivity', {
              date: dayjs(earliestGroupDeadline).format('DD.MM.YYYY, HH:mm'),
            }),
            (date) => {
              return earliestGroupDeadline
                ? dayjs(date).isBefore(dayjs(earliestGroupDeadline))
                : true
            }
          )
      : yup
          .date()
          .min(new Date(), t('manage.courseList.groupDeadlineFuture'))
          .max(
            yup.ref('endDate'),
            t('manage.courseList.groupDeadlineBeforeEnd')
          )
          .required(t('manage.courseList.groupDeadlineReq')),
    maxGroupSize: yup
      .number()
      .min(2, t('manage.courseList.maxGroupSizeMin'))
      .moreThan(
        yup.ref('preferredGroupSize'),
        t('manage.courseList.maxGroupSizeLargerThanPreferred')
      )
      .required(t('manage.courseList.maxGroupSizeReq')),
    preferredGroupSize: yup
      .number()
      .min(2, t('manage.courseList.preferredGroupSizeMin'))
      .required(t('manage.courseList.preferredGroupSizeReq')),
  })

  // convert all dates back to local time
  const today = new Date()
  const startDateInit = initialValues?.startDate
    ? dayjs(initialValues?.startDate).local().format().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
  const endDateInit = initialValues?.endDate
    ? dayjs(initialValues?.endDate).local().format().slice(0, 10)
    : new Date(today.setMonth(today.getMonth() + 6)).toISOString().slice(0, 10)
  const groupDeadlineDateInit = initialValues?.groupDeadlineDate
    ? dayjs(initialValues?.groupDeadlineDate).local().format().slice(0, 10)
    : endDateInit

  return (
    <Modal
      escapeDisabled
      title={
        initialValues
          ? t('manage.course.modifyCourse')
          : t('manage.courseList.createNewCourse')
      }
      open={modalOpen}
      onClose={onModalClose}
      className={{ content: '!w-full' }}
    >
      <Formik
        validateOnMount
        innerRef={formRef}
        initialValues={{
          name: initialValues?.name ?? '',
          displayName: initialValues?.displayName ?? '',
          description: initialValues?.description ?? '',
          color: initialValues?.color ?? '#0028A5',
          startDate: startDateInit,
          endDate: endDateInit,
          isGamificationEnabled: initialValues?.isGamificationEnabled ?? true,
          isGroupCreationEnabled: initialValues?.isGroupCreationEnabled ?? true,
          groupCreationDeadline: groupDeadlineDateInit,
          maxGroupSize: initialValues?.maxGroupSize ?? undefined,
          preferredGroupSize: initialValues?.preferredGroupSize ?? undefined,
        }}
        onSubmit={async (values, { setSubmitting }) =>
          onSubmit(values, setSubmitting, setShowErrorToast)
        }
        validationSchema={schema}
      >
        {({
          values,
          errors,
          isValid,
          isSubmitting,
          setTouched,
          setFieldValue,
          validateField,
        }) => (
          <Form>
            <CourseDateChangeMonitor
              values={values}
              setTouched={setTouched}
              validateField={validateField}
            />
            <GamificationSettingMonitor
              values={values}
              setFieldValue={setFieldValue}
            />
            <div className="flex flex-col gap-2">
              <div className="flex w-full flex-col gap-3 md:flex-row">
                <FormikTextField
                  name="name"
                  label={t('manage.courseList.courseName')}
                  placeholder={t('manage.courseList.courseName')}
                  tooltip={t('manage.courseList.courseNameTooltip')}
                  className={{ root: 'w-full md:w-1/2' }}
                  data={{ cy: 'course-name' }}
                  required
                />
                <FormikTextField
                  name="displayName"
                  label={t('manage.sessionForms.displayName')}
                  placeholder={t('manage.courseList.courseDisplayName')}
                  tooltip={t('manage.courseList.courseDisplayNameTooltip')}
                  className={{ root: 'w-full md:w-1/2' }}
                  data={{ cy: 'course-display-name' }}
                  required
                />
              </div>
              <EditorField
                fieldName="description"
                label={t('shared.generic.description')}
                placeholder={t('manage.courseList.addDescription')}
                tooltip={t('manage.courseList.courseDescriptionTooltip')}
                data={{ cy: 'course-description' }}
                className={{ input: { editor: 'h-20' } }}
                showToolbarOnFocus={false}
              />
              <div className="mt-2 flex flex-col gap-6">
                <div className="flex flex-col gap-2 md:grid md:grid-cols-3">
                  <FormikDateChanger
                    name="startDate"
                    label={t('manage.courseList.startDate')}
                    tooltip={t('manage.courseList.startDateTooltip')}
                    data={{ cy: 'course-start-date' }}
                    dataButton={{ cy: 'course-start-date-button' }}
                    disabled={startDatePast}
                    required
                  />
                  <FormikDateChanger
                    name="endDate"
                    label={t('manage.courseList.endDate')}
                    tooltip={t('manage.courseList.endDateTooltip')}
                    data={{ cy: 'course-end-date' }}
                    dataButton={{ cy: 'course-end-date-button' }}
                    required
                  />
                  <FormikColorPicker
                    required
                    name="color"
                    label={t('manage.courseList.courseColor')}
                    colorLabel={t('shared.generic.color')}
                    position="top-left"
                    submitText={t('shared.generic.confirm')}
                    dataTrigger={{ cy: 'course-color-trigger' }}
                    dataHexInput={{ cy: 'course-color-hex-input' }}
                    dataSubmit={{ cy: 'course-color-submit' }}
                    className={{
                      root: 'w-max',
                    }}
                  />
                </div>

                <div>
                  <H3>{t('shared.generic.gamification')}</H3>
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-3">
                    <FormikSwitchField
                      required
                      labelLeft
                      disabled={initialValues?.isGamificationEnabled}
                      name="isGamificationEnabled"
                      label={t('shared.generic.gamification')}
                      tooltip={t('manage.courseList.gamificationTooltip')}
                      className={{
                        label: 'font-bold text-gray-600',
                      }}
                      data={{ cy: 'course-gamification' }}
                    />
                    <FormikSwitchField
                      required
                      labelLeft
                      disabled={
                        !values.isGamificationEnabled ||
                        initialValues?.isGroupCreationEnabled
                      }
                      name="isGroupCreationEnabled"
                      label={t('manage.courseList.groupCreationEnabled')}
                      tooltip={
                        values.isGamificationEnabled
                          ? t('manage.courseList.groupCreationEnabledTooltip')
                          : t('manage.courseList.groupCreationDisabledTooltip')
                      }
                      className={{
                        label: 'font-bold text-gray-600',
                      }}
                      data={{ cy: 'toggle-group-creation-enabled' }}
                    />
                  </div>
                  {values.isGamificationEnabled &&
                    values.isGroupCreationEnabled && (
                      <div className="flex flex-col gap-2 md:mt-3 md:grid md:grid-cols-3">
                        <FormikDateChanger
                          name="groupCreationDeadline"
                          label={t('manage.courseList.groupCreationDeadline')}
                          tooltip={t(
                            'manage.courseList.groupCreationDeadlineTooltip'
                          )}
                          data={{ cy: 'group-creation-deadline' }}
                          dataButton={{ cy: 'group-creation-deadline-button' }}
                          required
                        />
                        {initialValues &&
                        initialValues.isGroupCreationEnabled ? (
                          <div className="mt-2 font-bold text-gray-600">
                            <div>{`${t('manage.courseList.maxGroupSize')}: ${initialValues.maxGroupSize}`}</div>{' '}
                            <div>{`${t('manage.courseList.preferredGroupSize')}: ${initialValues.preferredGroupSize}`}</div>
                          </div>
                        ) : (
                          <>
                            <FormikNumberField
                              name="maxGroupSize"
                              label={t('manage.courseList.maxGroupSize')}
                              tooltip={t(
                                'manage.courseList.maxGroupSizeTooltip'
                              )}
                              data={{ cy: 'max-group-size' }}
                              className={{ root: 'max-w-52' }}
                              required
                            />
                            <FormikNumberField
                              name="preferredGroupSize"
                              label={t('manage.courseList.preferredGroupSize')}
                              tooltip={t(
                                'manage.courseList.preferredGroupSizeTooltip'
                              )}
                              data={{ cy: 'preferred-group-size' }}
                              className={{ root: 'max-w-52' }}
                              required
                            />
                          </>
                        )}
                      </div>
                    )}
                </div>
              </div>
              {initialValues?.groupDeadlineDate &&
                values.groupCreationDeadline !== groupDeadlineDateInit &&
                dayjs(values.groupCreationDeadline) < dayjs() && (
                  <UserNotification
                    type="warning"
                    message={t('manage.courseList.groupDeadlineChangedToPast')}
                  />
                )}
            </div>
            <div className="mt-1 flex flex-row justify-between">
              {errors && (
                <div className="text-sm text-red-700">{errors.description}</div>
              )}
            </div>
            {values.isGamificationEnabled && (
              <UserNotification
                type="info"
                message={
                  values.isGroupCreationEnabled
                    ? t('manage.courseList.gamificationGroupsFixed')
                    : t('manage.courseList.gamificationFixed')
                }
                className={{ root: 'mt-2' }}
              />
            )}
            <Button
              disabled={!isValid || isSubmitting}
              type="submit"
              className={{
                root: twMerge(
                  'bg-primary-80 float-right mt-3 w-full font-bold text-white md:w-max',
                  (!isValid || isSubmitting) && 'cursor-not-allowed opacity-50'
                ),
              }}
              data={{ cy: 'manipulate-course-submit' }}
            >
              {initialValues
                ? t('shared.generic.save')
                : t('shared.generic.create')}
            </Button>
          </Form>
        )}
      </Formik>
      <ElementCreationErrorToast
        open={showErrorToast}
        setOpen={setShowErrorToast}
        error={t('manage.courseList.courseCreationFailed')}
      />
    </Modal>
  )
}

export default CourseManipulationModal
