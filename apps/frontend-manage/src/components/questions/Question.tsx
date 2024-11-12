import {
  faComment as faCommentRegular,
  faRectangleList as faListRegular,
  faCircleQuestion as faQuestionRegular,
} from '@fortawesome/free-regular-svg-icons'
import { IconDefinition, faArchive } from '@fortawesome/free-solid-svg-icons'
import { Button, Checkbox, H2, H3, Modal } from '@uzh-bf/design-system'
import { Badge } from '@uzh-bf/design-system/dist/future'
import React, { useState, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { twMerge } from 'tailwind-merge'
// TODO: readd modals and tags
// import QuestionDetailsModal from './QuestionDetailsModal'
// import QuestionDuplicationModal from './QuestionDuplicationModal'
import { useMutation, useQuery } from '@apollo/client'
import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { faPencil, faTrash, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  DeleteQuestionDocument,
  ElementStatus,
  ElementType,
  GetUserQuestionsDocument,
  UpdateElementGeneratedScoreDocument,
  Tag,
  DifficultyLevel,
  GetQuestionDifficultyDocument,
} from '@klicker-uzh/graphql/dist/ops'
import { Ellipsis } from '@klicker-uzh/markdown'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import ElementEditModal, {
  ElementEditMode,
} from './manipulation/ElementEditModal'
import QuestionTags from './QuestionTags'
import { usePageSource } from 'src/pageContext/PageContext'
// import QuestionTags from './QuestionTags'



const StatusColors: Record<ElementStatus, string> = {
  [ElementStatus.Draft]: 'bg-slate-400',
  [ElementStatus.Review]: 'bg-violet-400',
  [ElementStatus.Ready]: 'bg-green-400',
}


const DifficultyColors: Record<DifficultyLevel, string> = {
  [DifficultyLevel.Easy]: 'bg-green-400',
  [DifficultyLevel.Medium]: 'bg-yellow-400',
  [DifficultyLevel.Hard]: 'bg-red-400',
};

const ElementIcons: Record<ElementType, IconDefinition> = {
  FLASHCARD: faListRegular,
  CONTENT: faCommentRegular,
  SC: faQuestionRegular,
  MC: faQuestionRegular,
  KPRIM: faQuestionRegular,
  FREE_TEXT: faQuestionRegular,
  NUMERICAL: faQuestionRegular,
}

export interface QuestionDragDropTypes {
  id: number
  type: ElementType
  questionType: ElementType
  title: string
  content: string
  hasAnswerFeedbacks: boolean
  hasSampleSolution: boolean
}

interface QuestionProps {
  checked: boolean
  id: number
  isArchived?: boolean
  tags?: Tag[]
  handleTagClick: (tagName: string) => void
  title: string
  status: ElementStatus
  type: ElementType
  content: string
  onCheck: () => void
  unsetDeletedQuestion: (questionId: number) => void
  hasAnswerFeedbacks: boolean
  hasSampleSolution: boolean
  tagfilter?: string[]
  createdAt?: string
  updatedAt?: string
}

function Question({
  checked = false,
  id,
  tags = [],
  handleTagClick,
  title,
  status,
  type,
  content,
  onCheck,
  unsetDeletedQuestion,
  isArchived = false,
  hasAnswerFeedbacks,
  hasSampleSolution,
  tagfilter = [],
  createdAt,
  updatedAt,
}: QuestionProps): React.ReactElement {
  const t = useTranslations()
  const [isModificationModalOpen, setIsModificationModalOpen] = useState(false)
  const [isDuplicationModalOpen, setIsDuplicationModalOpen] = useState(false)
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false)
  const [deleteQuestion, { loading: deleting }] = useMutation(
    DeleteQuestionDocument
  )
  const [updateScore] = useMutation(UpdateElementGeneratedScoreDocument)

  const { data: difficultyData, loading: loadingDifficulty, error: errorDifficulty,} = useQuery(GetQuestionDifficultyDocument, {
    variables: { id },
  });

  const difficulty = difficultyData?.questionDifficulty;
  

  


  //Determine which subpage we are in
  const { isGeneratedPage } = usePageSource();
  // Track button states
  const [isGoodQuestionClicked, setIsGoodQuestionClicked] = useState(false);
  const [isBadQuestionClicked, setIsBadQuestionClicked] = useState(false);
  
  // Toggle button and score
  const handleGoodQuestionClick = async () => {
    const newGoodState = !isGoodQuestionClicked;
    setIsGoodQuestionClicked(newGoodState);
    setIsBadQuestionClicked(false); // Reset Bad Question button
    handleScoreUpdate(newGoodState ? 1 : 0);
  };
  
  const handleBadQuestionClick = async () => {
    const newBadState = !isBadQuestionClicked;
      setIsBadQuestionClicked(newBadState);
      setIsGoodQuestionClicked(false); // Reset Good Question button
      handleScoreUpdate(newBadState ? -1 : 0);
  };

  const handleScoreUpdate = async (scoreValue: number) => {
    try {
      await updateScore({
        variables: {
          id, 
          score: scoreValue,
        },
      })
      console.log('Score updated successfully')
    } catch (error) {
      console.error('Error updating score:', error)
    }
  }
  

  const [collectedProps, drag] = useDrag({
    item: {
      id,
      type,
      questionType: type,
      title,
      content,
      hasAnswerFeedbacks,
      hasSampleSolution,
    },
    collect: (monitor): any => ({
      isDragging: monitor.isDragging(),
    }),
    type,
  })

  return (
    <div
      className="flex items-center gap-1.5"
      data-cy={`question-item-${title}`}
    >
      <Checkbox checked={checked} onCheck={onCheck} />
      {drag(
        <div
          className={twMerge(
            'flex w-full cursor-[grab] flex-col gap-2 rounded-lg border border-solid p-3 hover:shadow-md md:flex-row',
            collectedProps.isDragging && 'opacity-50'
          )}
        >
          <div className="flex flex-1 flex-row">
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex flex-none flex-row items-center gap-2 text-lg">
                <a
                  className="hover:text-uzh-blue-100 inline-flex flex-1 cursor-pointer items-center text-xl font-bold"
                  role="button"
                  tabIndex={0}
                  type="button"
                  onClick={() => setIsModificationModalOpen(true)}
                  onKeyDown={() => setIsModificationModalOpen(true)}
                  data-cy="question-title"
                >
                  {/* <FontAwesomeIcon icon={ElementIcons[type]} className="mr-2" /> */}
                  {title}
                </a>

                {isArchived && (
                  <FontAwesomeIcon title="ARCHIVE" icon={faArchive} />
                )}
              </div>

              <div className="flex-1">
                <Ellipsis
                  // maxLines={3}
                  maxLength={120}
                >
                  {content}
                </Ellipsis>
              </div>

              <div className="flex flex-none flex-col gap-1 text-sm text-slate-600 md:flex-row md:gap-4">
                {!isGeneratedPage && (
                  <div className="w-20">
                    <Badge className={twMerge(StatusColors[status])}>
                      {t(`shared.${status}.statusLabel`)}
                    </Badge>
                  </div>
                )}

                {isGeneratedPage && (
                  <div className="w-20">
                    <Badge className={twMerge(DifficultyColors[difficulty])}>
                      {t(`shared.${difficulty}.difficultyLabel`)}
                    </Badge>
                  </div>
                )}

                <div className="w-36">{t(`shared.${type}.typeLabel`)}</div>
                <div>
                  {t('shared.generic.createdAt', {
                    date: dayjs(createdAt).format('DD.MM.YYYY HH:mm'),
                  })}
                </div>
                <div>
                  {t('shared.generic.updatedAt', {
                    date: dayjs(updatedAt).format('DD.MM.YYYY HH:mm'),
                  })}
                </div>
              </div>
            </div>
            <div className="mr-6 hidden w-max md:block">
              <QuestionTags
                tags={tags}
                tagfilter={tagfilter}
                handleTagClick={handleTagClick}
              />
            </div>
          </div>

          <div className="flex flex-row gap-2 md:flex-col">
            <Button
              className={{
                root: 'space-x-2 bg-white text-sm md:w-36 md:text-base',
              }}
              onClick={(): void => setIsModificationModalOpen(true)}
              data={{ cy: `edit-question-${title}` }}
            >
              <Button.Icon>
                <FontAwesomeIcon icon={faPencil} />
              </Button.Icon>
              <Button.Label>{isGeneratedPage ? t('shared.generic.preview') : t('shared.generic.edit')}</Button.Label>
            </Button>
            {isModificationModalOpen && (
              <ElementEditModal
                handleSetIsOpen={setIsModificationModalOpen}
                isOpen={isModificationModalOpen}
                questionId={id}
                mode={ElementEditMode.EDIT}
              />
            )}
            {/* Add user feedback*/}
            {isGeneratedPage && (
              <>
              <Button 
                onClick={handleGoodQuestionClick} 
                className={{
                  root:`space-x-2 ${
                      isGoodQuestionClicked ? 'bg-green-200' : 'bg-white'
                    } text-sm md:w-36 md:text-base`,}}>
                <Button.Icon>
                  <FontAwesomeIcon icon={faThumbsUp} />
                </Button.Icon>
                <Button.Label>{t('manage.aiRelate.goodQuestion')}</Button.Label>
              </Button>
              <Button 
                onClick={handleBadQuestionClick} 
                className={{
                  root:`space-x-2 ${
                      isBadQuestionClicked ? 'bg-red-200' : 'bg-white'
                    } text-sm md:w-36 md:text-base`,}}>
                <Button.Icon>
                  <FontAwesomeIcon icon={faThumbsDown} />
                </Button.Icon>
                <Button.Label>{t('manage.aiRelate.badQuestion')}</Button.Label>
              </Button>
              </>
            )}

            {!isGeneratedPage && (
              <>
                <Button
                  className={{
                  root: 'space-x-2 bg-white text-sm md:w-36 md:text-base',
                  }}
                  onClick={(): void => setIsDuplicationModalOpen(true)}
                  data={{ cy: `duplicate-question-${title}` }}
                >
                <Button.Icon>
                  <FontAwesomeIcon icon={faCopy} />
                </Button.Icon>
                <Button.Label>{t('shared.generic.duplicate')}</Button.Label>
                </Button>
                {isDuplicationModalOpen && (
                  <ElementEditModal
                    handleSetIsOpen={setIsDuplicationModalOpen}
                    isOpen={isDuplicationModalOpen}
                    questionId={id}
                    mode={ElementEditMode.DUPLICATE}
                  />
                )}
                <Button
                  className={{
                  root: 'space-x-2 border-red-400 text-sm md:w-36 md:text-base',
                  }}
                  onClick={() => setIsDeletionModalOpen(true)}
                  data={{ cy: `delete-question-${title}` }}
                >
                <Button.Icon>
                  <FontAwesomeIcon icon={faTrash} />
                </Button.Icon>
                <Button.Label>{t('shared.generic.delete')}</Button.Label>
                </Button>
              </>
            )}
            <Modal
              hideCloseButton
              onPrimaryAction={
                <Button
                  loading={deleting}
                  onClick={async () => {
                    await deleteQuestion({
                      variables: {
                        id,
                      },
                      update(cache) {
                        const data = cache.readQuery({
                          query: GetUserQuestionsDocument,
                        })
                        cache.writeQuery({
                          query: GetUserQuestionsDocument,
                          data: {
                            userQuestions:
                              data?.userQuestions?.filter((e) => e.id !== id) ??
                              [],
                          },
                        })
                      },
                      optimisticResponse: {
                        deleteQuestion: {
                          id,
                        },
                      },
                    })
                    unsetDeletedQuestion(id)
                    setIsDeletionModalOpen(false)
                  }}
                  className={{ root: 'bg-red-600 font-bold text-white' }}
                  data={{ cy: 'confirm-question-deletion' }}
                >
                  {t('shared.generic.delete')}
                </Button>
              }
              onSecondaryAction={
                <Button onClick={(): void => setIsDeletionModalOpen(false)}>
                  {t('shared.generic.cancel')}
                </Button>
              }
              onClose={(): void => setIsDeletionModalOpen(false)}
              open={isDeletionModalOpen}
              className={{
                content: 'h-max min-h-max w-[40rem] self-center !pt-0',
              }}
            >
              <div>
                <H2>{t('manage.questionPool.deleteQuestion')}</H2>
                <div>{t('manage.questionPool.confirmDeletion')}</div>
                <div className="border-uzh-grey-40 mt-1 rounded border border-solid p-2">
                  <H3>
                    {title} ({t(`shared.${type}.short`)})
                  </H3>
                  <div>{content}</div>
                </div>
                <div className="mb-2 mt-4 text-sm italic">
                  {t('manage.questionPool.noQuestionRecovery')}
                </div>
              </div>
            </Modal>
          </div>
        </div>
      )}
    </div>
  )
}

export default Question
