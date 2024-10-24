import { SubscribeToMoreOptions, useMutation } from '@apollo/client'
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  ChangeSessionSettingsDocument,
  ConfusionSummary,
  DeleteFeedbackDocument,
  DeleteFeedbackResponseDocument,
  Feedback,
  FeedbackCreatedDocument,
  GetCockpitSessionDocument,
  PinFeedbackDocument,
  PublishFeedbackDocument,
  ResolveFeedbackDocument,
  RespondToFeedbackDocument,
  Session,
} from '@klicker-uzh/graphql/dist/ops'
import { push } from '@socialgouv/matomo-next'
import { H2, Switch } from '@uzh-bf/design-system'
import Link from 'next/link'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslations } from 'next-intl'
import ConfusionCharts from './confusion/ConfusionCharts'
import FeedbackChannel from './feedbacks/FeedbackChannel'
interface Props {
  sessionId: string
  sessionName: string
  confusionValues?: ConfusionSummary
  feedbacks?: Feedback[]
  isLiveQAEnabled: boolean
  isConfusionFeedbackEnabled: boolean
  isModerationEnabled: boolean
  isGamificationEnabled: boolean
  subscribeToMore: (doc: SubscribeToMoreOptions) => any
}

function AudienceInteraction({
  sessionId,
  sessionName,
  confusionValues,
  feedbacks,
  isLiveQAEnabled,
  isConfusionFeedbackEnabled,
  isModerationEnabled,
  isGamificationEnabled,
  subscribeToMore,
}: Props) {
  const t = useTranslations()

  useEffect(() => {
    if (!sessionId) return

    const feedbackAdded = subscribeToMore({
      document: FeedbackCreatedDocument,
      variables: { sessionId },
      updateQuery: (
        prev: { cockpitSession: Session },
        {
          subscriptionData,
        }: { subscriptionData: { data: { feedbackCreated: Feedback } } }
      ) => {
        if (!subscriptionData.data) return prev
        const newItem = subscriptionData.data.feedbackCreated
        const updatedSession = {
          ...prev.cockpitSession,
          feedbacks: [newItem, ...(prev.cockpitSession.feedbacks ?? [])],
        }

        return {
          cockpitSession: updatedSession,
        }
      },
    })

    return () => {
      feedbackAdded && feedbackAdded()
    }
  }, [subscribeToMore, sessionId])

  const [changeSessionSettings] = useMutation(ChangeSessionSettingsDocument)
  const [publishFeedback] = useMutation(PublishFeedbackDocument)
  const [pinFeedback] = useMutation(PinFeedbackDocument)
  const [resolveFeedback] = useMutation(ResolveFeedbackDocument)
  const [deleteFeedback] = useMutation(DeleteFeedbackDocument)
  const [deleteFeedbackResponse] = useMutation(DeleteFeedbackResponseDocument)
  const [respondToFeedback] = useMutation(RespondToFeedbackDocument)

  return (
    <div className="flex flex-col justify-between md:flex-row md:flex-wrap">
      <div
        className={twMerge(
          'flex w-full flex-col gap-2 md:flex-row md:items-start md:gap-8'
        )}
      >
        <div className="flex flex-grow flex-col gap-4 md:w-2/3">
          <div className="flex flex-row flex-wrap items-end justify-between print:hidden">
            <H2>{t('manage.cockpit.liveQA')}</H2>
            <div className="flex flex-row flex-wrap items-end gap-4">
              <Link
                href={`/sessions/${sessionId}/lecturer`}
                target="_blank"
                passHref
                legacyBehavior
              >
                <a
                  className="inline-flex items-center gap-1"
                  data-cy={`open-lecturer-overview-session-${sessionName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faUpRightFromSquare} />
                  {t('manage.cockpit.lecturerView')}
                </a>
              </Link>
              <Switch
                data={{ cy: 'toggle-qa' }}
                checked={isLiveQAEnabled}
                onCheckedChange={(): void => {
                  changeSessionSettings({
                    variables: {
                      id: sessionId,
                      isLiveQAEnabled: !isLiveQAEnabled,
                    },
                  })
                  push([
                    'trackEvent',
                    'Running Session',
                    !isLiveQAEnabled
                      ? 'Feedback Channel Activated'
                      : 'Feedback Channel Deactivated',
                  ])
                }}
                label={t('manage.cockpit.activateQA')}
              />
              <Switch
                data={{ cy: 'toggle-moderation' }}
                checked={isModerationEnabled}
                disabled={!isLiveQAEnabled}
                onCheckedChange={(): void => {
                  changeSessionSettings({
                    variables: {
                      id: sessionId,
                      isModerationEnabled: !isModerationEnabled,
                    },
                  })
                  push([
                    'trackEvent',
                    'Running Session',
                    'Feedback Moderation Toggled',
                    String(!isModerationEnabled),
                  ])
                }}
                label={t('manage.cockpit.activateModeration')}
                className={{
                  element: twMerge(!isLiveQAEnabled && 'bg-uzh-grey-40'),
                  label: twMerge(!isLiveQAEnabled && 'text-gray-40'),
                }}
              />
            </div>
          </div>

          {!isLiveQAEnabled && (
            <div className="flex flex-1 items-center justify-center rounded border font-bold print:hidden">
              {t('manage.cockpit.QaNotActive')}
            </div>
          )}

          {isLiveQAEnabled && (
            <div className="flex flex-1 flex-col rounded border p-4 md:flex-row md:flex-wrap print:border-0">
              <div className="flex-1">
                <FeedbackChannel
                  sessionName={sessionName}
                  feedbacks={feedbacks}
                  handleDeleteFeedback={(feedbackId: number): void => {
                    deleteFeedback({
                      variables: { id: feedbackId },
                      optimisticResponse: {
                        deleteFeedback: {
                          id: feedbackId,
                          __typename: 'Feedback',
                        },
                      },
                      update(cache, res) {
                        const removedFeedback = res.data?.deleteFeedback
                        const data = cache.readQuery({
                          query: GetCockpitSessionDocument,
                          variables: { id: sessionId },
                        })

                        if (data?.cockpitSession && removedFeedback) {
                          cache.writeQuery({
                            query: GetCockpitSessionDocument,
                            variables: { id: sessionId },
                            data: {
                              cockpitSession: {
                                ...data.cockpitSession,
                                feedbacks:
                                  data.cockpitSession.feedbacks?.filter(
                                    (feedback) =>
                                      feedback.id !== removedFeedback.id
                                  ) ?? [],
                              },
                            },
                          })
                        }
                      },
                    })
                    push(['trackEvent', 'Running Session', 'Feedback Deleted'])
                  }}
                  handleDeleteFeedbackResponse={(responseId: number) => {
                    deleteFeedbackResponse({
                      variables: { id: responseId },
                      update(cache, res) {
                        const updatedFeedback = res.data?.deleteFeedbackResponse
                        const data = cache.readQuery({
                          query: GetCockpitSessionDocument,
                          variables: { id: sessionId },
                        })

                        if (data?.cockpitSession && updatedFeedback) {
                          cache.writeQuery({
                            query: GetCockpitSessionDocument,
                            variables: { id: sessionId },
                            data: {
                              cockpitSession: {
                                ...data.cockpitSession,
                                feedbacks: data.cockpitSession.feedbacks?.map(
                                  (feedback) => {
                                    if (feedback.id === updatedFeedback.id) {
                                      return updatedFeedback
                                    }
                                    return feedback
                                  }
                                ),
                              },
                            },
                          })
                        }
                      },
                    })

                    push([
                      'trackEvent',
                      'Running Session',
                      'Feedback Response Deleted',
                    ])
                  }}
                  handlePinFeedback={(
                    feedbackId: number,
                    isPinned: boolean
                  ) => {
                    pinFeedback({
                      variables: { id: feedbackId, isPinned: isPinned },
                    })
                    push([
                      'trackEvent',
                      'Running Session',
                      'Feedback Pinned',
                      String(isPinned),
                    ])
                  }}
                  handlePublishFeedback={(
                    feedbackId: number,
                    isPublished: boolean
                  ) => {
                    publishFeedback({
                      variables: { id: feedbackId, isPublished: isPublished },
                    })
                    push([
                      'trackEvent',
                      'Running Session',
                      'Feedback Published',
                      String(isPublished),
                    ])
                  }}
                  handleResolveFeedback={(
                    feedbackId: number,
                    isResolved: boolean
                  ) => {
                    resolveFeedback({
                      variables: { id: feedbackId, isResolved: isResolved },
                    })
                    push([
                      'trackEvent',
                      'Running Session',
                      'Feedback Resolved',
                      String(isResolved),
                    ])
                  }}
                  handleRespondToFeedback={(
                    feedbackId: number,
                    response: string
                  ) => {
                    respondToFeedback({
                      variables: {
                        id: feedbackId,
                        responseContent: response,
                      },
                    })
                    push([
                      'trackEvent',
                      'Running Session',
                      'Feedback Response Added',
                      response.length,
                    ])
                  }}
                  isActive={isLiveQAEnabled}
                  isPublic={!isModerationEnabled}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-auto flex-col gap-4 md:w-[250px] md:flex-row md:flex-wrap print:hidden">
          <div className="flex w-full flex-none flex-row flex-wrap items-end justify-between gap-2">
            <H2>{t('shared.generic.feedback')}</H2>
            <Switch
              data={{ cy: 'toggle-gamification' }}
              checked={isConfusionFeedbackEnabled}
              onCheckedChange={(): void => {
                changeSessionSettings({
                  variables: {
                    id: sessionId,
                    isConfusionFeedbackEnabled: !isConfusionFeedbackEnabled,
                  },
                })
                push([
                  'trackEvent',
                  'Running Session',
                  'Feedback Moderation Toggled',
                  String(!isConfusionFeedbackEnabled),
                ])
              }}
              label={t('manage.cockpit.activateFeedback')}
              className={{
                root: twMerge('items-start'),
              }}
            />
          </div>
          <div className="flex-1 flex-shrink rounded border p-4 md:max-h-[31rem] print:hidden">
            {isConfusionFeedbackEnabled ? (
              // <div className="flex-initial mx-auto md:mt-4 p-4 w-[300px] sm:w-[600px] lg:w-[300px] bg-primary-bg rounded shadow print:hidden border-primary border-solid border md:max-h-[31rem]">
              <ConfusionCharts confusionValues={confusionValues} />
            ) : (
              // </div>
              <div className="flex min-h-[355px] items-center justify-center font-bold">
                {t('manage.cockpit.feedbackNotActive')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudienceInteraction
