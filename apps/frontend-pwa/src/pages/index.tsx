import { useMutation, useQuery } from '@apollo/client'
import { faBookmark } from '@fortawesome/free-regular-svg-icons'
import {
  faBookOpenReader,
  faChalkboard,
  faCheck,
  faCirclePlus,
  faGraduationCap,
  faLink,
  faRepeat,
} from '@fortawesome/free-solid-svg-icons'
import {
  MicroLearning,
  ParticipationsDocument,
  Session,
  SubscribeToPushDocument,
  UnsubscribeFromPushDocument,
} from '@klicker-uzh/graphql/dist/ops'
import Loader from '@klicker-uzh/shared-components/src/Loader'
import usePushNotifications from '@klicker-uzh/shared-components/src/hooks/usePushNotifications'
import { H1, Toast, UserNotification } from '@uzh-bf/design-system'
import dayjs from 'dayjs'
import { GetStaticPropsContext } from 'next'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import MicroLearningListSubscriber from '~/components/microLearning/MicroLearningListSubscriber'
import CourseElement from '../components/CourseElement'
import Layout from '../components/Layout'
import LinkButton from '../components/common/LinkButton'

type LocalCourseType = {
  id: string
  displayName: string
  description?: string
  isSubscribed: boolean
  startDate: string
  endDate: string
  isGamificationEnabled: boolean
}

type LocalLiveSessionType = Partial<Session> & { courseName: string }

type LocalMicroLearningType = Pick<
  MicroLearning,
  'id' | 'displayName' | 'scheduledStartAt' | 'scheduledEndAt'
> & {
  courseName: string
  isCompleted: boolean
}

const Index = function () {
  const t = useTranslations()

  // const { stickyValue: hasSeenSurvey, setValue: setHasSeenSurvey } =
  //   useStickyState('hasSeenSurvey', 'false')

  const [subscribeToPush] = useMutation(SubscribeToPushDocument)
  const [unsubscribeFromPush] = useMutation(UnsubscribeFromPushDocument)
  const [endedMicroLearning, setEndedMicroLearning] = useState<
    string | undefined
  >()

  async function subscribeUser(
    subscriptionObject: PushSubscription,
    courseId: string
  ) {
    await subscribeToPush({
      variables: {
        subscriptionObject: {
          endpoint: subscriptionObject.endpoint,
          expirationTime: subscriptionObject.expirationTime,
          keys: {
            auth: subscriptionObject.toJSON().keys!.auth,
            p256dh: subscriptionObject.toJSON().keys!.p256dh,
          },
        },
        courseId,
      },
      refetchQueries: [
        {
          query: ParticipationsDocument,
          variables: { endpoint: subscriptionObject.endpoint },
        },
      ],
    })
  }

  async function unsubscribeUser(
    subscriptionObject: PushSubscription,
    courseId: string
  ) {
    await unsubscribeFromPush({
      variables: {
        courseId,
        endpoint: subscriptionObject.endpoint,
      },
      refetchQueries: [
        {
          query: ParticipationsDocument,
          variables: { endpoint: subscriptionObject.endpoint },
        },
      ],
    })
  }

  const {
    userInfo,
    setUserInfo,
    subscription,
    subscribeUserToPush,
    unsubscribeUserFromPush,
  } = usePushNotifications({
    subscribeToPush: subscribeUser,
    unsubscribeFromPush: unsubscribeUser,
  })

  const { data, loading, subscribeToMore } = useQuery(ParticipationsDocument, {
    variables: { endpoint: subscription?.endpoint },
    fetchPolicy: 'network-only',
  })

  const {
    courses,
    oldCourses,
    activeSessions,
    activeMicrolearning,
  }: {
    courses: LocalCourseType[]
    oldCourses: LocalCourseType[]
    activeSessions: LocalLiveSessionType[]
    activeMicrolearning: LocalMicroLearningType[]
  } = useMemo(() => {
    const obj = {
      courses: [] as LocalCourseType[],
      oldCourses: [] as LocalCourseType[],
      activeSessions: [] as LocalLiveSessionType[],
      activeMicrolearning: [] as LocalMicroLearningType[],
    }
    if (!data?.participations) return obj
    return data.participations.reduce((acc, participation) => {
      if (!participation.course) return acc
      const course = participation.course

      return {
        courses:
          // check if endDate of course is before today or today
          dayjs(participation.course?.endDate).isAfter(dayjs()) ||
          dayjs(participation.course?.endDate).isSame(dayjs())
            ? [
                ...acc.courses,
                {
                  id: participation.course?.id,
                  displayName: participation.course?.displayName,
                  startDate: participation.course?.startDate,
                  endDate: participation.course?.endDate,
                  isGamificationEnabled:
                    participation.course?.isGamificationEnabled,
                  isSubscribed:
                    (participation.subscriptions &&
                      participation.subscriptions.length > 0) ??
                    false,
                },
              ]
            : acc.courses,
        oldCourses: dayjs(participation.course?.endDate).isBefore(dayjs())
          ? [
              ...acc.oldCourses,
              {
                id: participation.course?.id,
                displayName: participation.course?.displayName,
                startDate: participation.course?.startDate,
                endDate: participation.course?.endDate,
                isGamificationEnabled:
                  participation.course?.isGamificationEnabled,
                isSubscribed:
                  (participation.subscriptions &&
                    participation.subscriptions.length > 0) ??
                  false,
              },
            ]
          : acc.oldCourses,
        activeSessions: [
          ...acc.activeSessions,
          ...(course.sessions?.map((session) => ({
            ...session,
            courseName: course.displayName,
          })) ?? []),
        ],
        activeMicrolearning: [
          ...acc.activeMicrolearning,
          ...(course.microLearnings?.map((micro) => ({
            ...micro,
            courseName: course.displayName,
            isCompleted: participation.completedMicroLearnings?.includes(
              micro.id
            ),
          })) ?? []),
        ],
      }
    }, obj)
  }, [data])

  if (loading || !data) {
    return (
      <Layout key="loading-layout" displayName={t('shared.generic.title')}>
        <Loader />
      </Layout>
    )
  }

  async function onSubscribeClick(
    isSubscribedToPush: boolean,
    courseId: string
  ) {
    setUserInfo('')
    console.log('onSubscribeClick')
    try {
      if (isSubscribedToPush) {
        await unsubscribeUserFromPush(courseId)
      } else {
        await subscribeUserToPush(courseId)
      }
    } catch (error) {
      console.error('An error occurred while un/subscribing a user: ', error)
    }
  }

  return (
    <Layout key="pwa-home-layout" displayName={t('shared.generic.title')}>
      <div
        className="flex flex-col gap-4 md:mx-auto md:w-full md:max-w-xl md:rounded md:border md:p-8"
        data-cy="homepage"
      >
        {/* {hasSeenSurvey === 'false' && (
          <Link
            href="https://qualtricsxm2zqlm4s5q.qualtrics.com/jfe/form/SV_0qyOBbtR0TXnpe6"
            target="_blank"
          >
            <Button
              className={{
                root: 'text-sm flex flex-row gap-4 items-center bg-orange-100 border border-orange-200 rounded-lg p-2 text-left',
              }}
              onClick={() => {
                setHasSeenSurvey(true)
              }}
            >
              <div>
                <FontAwesomeIcon icon={faBullhorn} />
              </div>
              <div>{t('pwa.general.surveyInvitation')}</div>
            </Button>
          </Link>
        )} */}

        {activeSessions.length !== 0 && (
          <div>
            <H1 className={{ root: 'mb-2 text-xl' }}>
              {t('shared.generic.activeSessions')}
            </H1>
            <div className="flex flex-col gap-2">
              {activeSessions.map((session) => (
                <LinkButton
                  href={session.linkTo || `/session/${session.id}`}
                  key={session.id}
                  icon={session.linkTo ? faLink : faChalkboard}
                  data={{ cy: `live-quiz-${session.displayName}` }}
                >
                  <div className="flex flex-row items-end justify-between md:flex-row">
                    <div>{session.displayName}</div>
                    <div className="text-sm">{session.courseName}</div>
                  </div>
                </LinkButton>
              ))}
            </div>
          </div>
        )}
        <div>
          <H1 className={{ root: 'mb-2 text-xl' }}>
            {t('shared.generic.practice')}
          </H1>
          <div className="flex flex-col gap-2">
            <LinkButton
              data={{ cy: 'practice-pool' }}
              href="/practice"
              icon={faRepeat}
            >
              {t('shared.generic.practicePool')}
            </LinkButton>
            <LinkButton
              data={{ cy: 'quizzes' }}
              href="/repetition"
              icon={faGraduationCap}
            >
              {t('shared.generic.practiceQuizzes')}
            </LinkButton>
            <LinkButton
              data={{ cy: 'bookmarks' }}
              href="/bookmarks"
              icon={faBookmark}
            >
              {t('pwa.general.myBookmarks')}
            </LinkButton>
          </div>
        </div>
        {activeMicrolearning.length > 0 && (
          <div data-cy="microlearnings">
            <H1 className={{ root: 'mb-2 text-xl' }}>
              {t('shared.generic.microlearning')}
            </H1>
            <div className="flex flex-col gap-2">
              {activeMicrolearning.map((micro) => (
                <LinkButton
                  icon={micro.isCompleted ? faCheck : faBookOpenReader}
                  href={micro.isCompleted ? '' : `/microlearning/${micro.id}/`}
                  key={micro.id}
                  disabled={micro.isCompleted}
                  className={{
                    root: micro.isCompleted
                      ? 'hover:bg-unset cursor-not-allowed'
                      : '',
                  }}
                  data={{ cy: `microlearning-${micro.displayName}` }}
                >
                  <MicroLearningListSubscriber
                    activityId={micro.id}
                    setEndedMicroLearning={setEndedMicroLearning}
                    subscribeToMore={subscribeToMore}
                  />
                  <div>{micro.displayName}</div>
                  <div className="flex flex-row items-end justify-between text-xs">
                    <div>
                      {dayjs(micro.scheduledStartAt).format('DD.MM.YYYY HH:mm')}{' '}
                      - {dayjs(micro.scheduledEndAt).format('DD.MM.YYYY HH:mm')}
                    </div>
                    <div>{micro.courseName}</div>
                  </div>
                </LinkButton>
              ))}
            </div>
          </div>
        )}
        <div>
          <H1 className={{ root: 'mb-2 text-xl' }}>
            {t('pwa.general.myCourses')}
          </H1>
          <div className="flex flex-col gap-2">
            {courses.map((course) => (
              <CourseElement
                key={course.id}
                course={course}
                onSubscribeClick={onSubscribeClick}
              />
            ))}
            {oldCourses.map((course) => (
              <CourseElement key={course.id} course={course} />
            ))}
            <LinkButton
              icon={faCirclePlus}
              href="/join"
              data={{ cy: 'join-new-course' }}
            >
              {t('pwa.general.joinCourse')}
            </LinkButton>
          </div>
        </div>
        {userInfo && <UserNotification type="info" message={userInfo} />}
        {/* <SurveyPromotion courseId={courses?.[0]?.id} /> */}
      </div>
      <Toast
        type="warning"
        openExternal={typeof endedMicroLearning !== 'undefined'}
        onCloseExternal={() => setEndedMicroLearning(undefined)}
        duration={10000}
        className={{ root: 'max-w-[30rem]' }}
        dismissible
      >
        {t('pwa.courses.microLearningEndedToast', {
          activityName: endedMicroLearning,
        })}
      </Toast>
    </Layout>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`@klicker-uzh/i18n/messages/${locale}`)).default,
    },
  }
}

export default Index
