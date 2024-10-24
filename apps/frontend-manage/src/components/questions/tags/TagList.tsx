import {
  faCheckCircle as faCheckCircleRegular,
  faCircleXmark,
  faCommentDots as faCommentDotsRegular,
  faComment as faCommentRegular,
  faEye as faEyeRegular,
  faRectangleList as faListRegular,
  faPenToSquare as faPenRegular,
  faCircleQuestion as faQuestionRegular,
} from '@fortawesome/free-regular-svg-icons'
import {
  IconDefinition,
  faCheckCircle as faCheckCircleSolid,
  faCommentDots as faCommentDotsSolid,
  faComment as faCommentSolid,
  faEye as faEyeSolid,
  faRectangleList as faListSolid,
  faPenToSquare as faPenSolid,
  faCircleQuestion as faQuestionSolid,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ElementStatus, ElementType } from '@klicker-uzh/graphql/dist/ops'
import Loader from '@klicker-uzh/shared-components/src/Loader'
import { Button, Switch } from '@uzh-bf/design-system'
import { useTranslations } from 'next-intl'
import React, { Suspense, useMemo, useState } from 'react'
import SuspendedTags from './SuspendedTags'
import TagHeader from './TagHeader'
import TagItem from './TagItem'

const elementTypeFilters: Record<ElementType, IconDefinition[]> = {
  CONTENT: [faCommentRegular, faCommentSolid],
  FLASHCARD: [faListRegular, faListSolid],
  SC: [faQuestionRegular, faQuestionSolid],
  MC: [faQuestionRegular, faQuestionSolid],
  KPRIM: [faQuestionRegular, faQuestionSolid],
  FREE_TEXT: [faQuestionRegular, faQuestionSolid],
  NUMERICAL: [faQuestionRegular, faQuestionSolid],
}

const elementStatusFilters: Record<ElementStatus, IconDefinition[]> = {
  DRAFT: [faPenRegular, faPenSolid],
  REVIEW: [faEyeRegular, faEyeSolid],
  READY: [faCheckCircleRegular, faCheckCircleSolid],
}

interface Props {
  compact: boolean
  isArchiveActive: boolean
  showUntagged: boolean
  activeTags: string[]
  activeStatus?: ElementStatus
  activeType?: ElementType
  sampleSolution: boolean
  answerFeedbacks: boolean
  handleReset: () => void
  handleTagClick: ({
    tagName,
    isTypeTag,
    isStatusTag,
    isUntagged,
  }: {
    tagName: string
    isTypeTag: boolean
    isStatusTag: boolean
    isUntagged: boolean
  }) => void
  toggleSampleSolutionFilter: () => void
  toggleAnswerFeedbackFilter: () => void
  handleToggleArchive: () => void
}

function TagList({
  compact,
  isArchiveActive,
  showUntagged,
  activeTags,
  activeType,
  activeStatus,
  sampleSolution,
  answerFeedbacks,
  handleTagClick,
  handleReset,
  toggleSampleSolutionFilter,
  toggleAnswerFeedbackFilter,
  handleToggleArchive,
}: Props): React.ReactElement {
  const t = useTranslations()

  const [questionStatusVisible, setQuestionStatusVisible] = useState(!compact)
  const [questionTypesVisible, setQuestionTypesVisible] = useState(!compact)
  const [userTagsVisible, setUserTagsVisible] = useState(!compact)
  const [gamificationTagsVisible, setGamificationTagsVisible] =
    useState(!compact)

  const resetDisabled = useMemo(
    () =>
      !(
        activeTags.length > 0 ||
        activeType ||
        activeStatus ||
        sampleSolution ||
        answerFeedbacks ||
        showUntagged
      ),
    [
      activeTags,
      activeType,
      activeStatus,
      sampleSolution,
      answerFeedbacks,
      showUntagged,
    ]
  )

  return (
    <div className="border-uzh-grey-60 flex h-max max-h-full flex-1 flex-col overflow-y-auto rounded-md border border-solid p-2 text-sm md:w-[14rem]">
      <TagHeader
        text={t('manage.questionPool.elementStatus')}
        state={questionStatusVisible}
        setState={setQuestionStatusVisible}
      />

      {questionStatusVisible && (
        <ul className="list-none">
          {Object.entries(elementStatusFilters).map(([status, icons]) => (
            <TagItem
              key={status}
              text={t(`shared.${status as ElementStatus}.statusLabel`)}
              icon={icons}
              active={activeStatus === status}
              onClick={(): void =>
                handleTagClick({
                  tagName: status,
                  isTypeTag: false,
                  isStatusTag: true,
                  isUntagged: false,
                })
              }
            />
          ))}
        </ul>
      )}

      <TagHeader
        text={t('manage.questionPool.elementTypes')}
        state={questionTypesVisible}
        setState={setQuestionTypesVisible}
      />

      {questionTypesVisible && (
        <ul className="list-none">
          {Object.entries(elementTypeFilters).map(([type, icons]) => (
            <TagItem
              key={type}
              text={t(`shared.${type as ElementType}.typeLabel`)}
              icon={icons}
              active={activeType === type}
              onClick={(): void =>
                handleTagClick({
                  tagName: type,
                  isTypeTag: true,
                  isStatusTag: false,
                  isUntagged: false,
                })
              }
            />
          ))}
        </ul>
      )}

      <TagHeader
        text={t('manage.questionPool.tags')}
        state={userTagsVisible}
        setState={setUserTagsVisible}
      />
      {userTagsVisible && (
        <Suspense fallback={<Loader />}>
          <SuspendedTags
            showUntagged={showUntagged}
            activeTags={activeTags}
            handleTagClick={handleTagClick}
          />
        </Suspense>
      )}

      <TagHeader
        text={t('shared.generic.gamification')}
        state={gamificationTagsVisible}
        setState={setGamificationTagsVisible}
      />
      {gamificationTagsVisible && (
        <ul className="list-none">
          <TagItem
            text={t('shared.generic.sampleSolution')}
            icon={[faCheckCircleRegular, faCheckCircleSolid]}
            active={sampleSolution}
            onClick={toggleSampleSolutionFilter}
          />
          <TagItem
            text={t('manage.questionPool.answerFeedbacks')}
            icon={[faCommentDotsRegular, faCommentDotsSolid]}
            active={answerFeedbacks}
            onClick={toggleAnswerFeedbackFilter}
          />
        </ul>
      )}

      <div className="mt-4 px-2">
        <Switch
          size="sm"
          label={t('manage.questionPool.showArchived')}
          checked={isArchiveActive}
          onCheckedChange={(): void => handleToggleArchive()}
        />
      </div>

      <Button
        className={{ root: 'mx-2 mb-2 mt-4' }}
        disabled={resetDisabled}
        onClick={(): void => handleReset()}
        data={{ cy: 'reset-question-pool-filters' }}
      >
        <Button.Icon className={{ root: 'mr-1' }}>
          <FontAwesomeIcon icon={faCircleXmark} />
        </Button.Icon>
        <Button.Label>{t('manage.questionPool.resetFilters')}</Button.Label>
      </Button>
    </div>
  )
}

export default TagList
