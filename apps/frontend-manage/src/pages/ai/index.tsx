import { ApolloError, useMutation, useQuery } from '@apollo/client'
import type { Element } from '@klicker-uzh/graphql/dist/ops'
import {
  ElementType,
  GenerateQuestionsApiDocument,
  GetGeneratedQuestionsCountDocument,
  GetHistoryGeneratedQuestionsDocument,
  GetLatestNQuestionsDocument,
  UploadFileApiDocument,
} from '@klicker-uzh/graphql/dist/ops'
import Loader from '@klicker-uzh/shared-components/src/Loader'
import { Button, H2, Label, Select } from '@uzh-bf/design-system'
import { GetStaticPropsContext } from 'next'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { pickBy } from 'remeda'
import { PageSourceProvider } from 'src/pageContext/PageContext'
import Layout from '../../components/Layout'
import QuestionList from '../../components/questions/QuestionList'

export default function Home() {
  const t = useTranslations()

  const [selectedQuestions, setSelectedQuestions] = useState<
    Record<number, Element | undefined>
  >({})

  const selectedQuestionData = useMemo(
    () =>
      pickBy(
        selectedQuestions,
        (value) => typeof value !== 'undefined'
      ) as Record<number, Element>,
    [selectedQuestions]
  )

  const [selectedType, setSelectedType] = useState<string>()
  const [selectedModel, setSelectedModel] = useState<string>()
  const [numQuestions, setNumQuestions] = useState<string>()
  const [difficultyLevel, setDifficultyLevel] = useState<string>()
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [questionsGenerated, setQuestionsGenerated] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [historyQuestions, setHistoryQuestions] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'generating' | 'history'>(
    'generating'
  )
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isFileUploaded, setIsFileUploaded] = useState(false)
  const [fileChanged, setFileChanged] = useState(false)
  const itemsPerPage = 10 // number of question displayed per page

  const [generatedQuestion] = useMutation(GenerateQuestionsApiDocument)
  const [uploadFile] = useMutation(UploadFileApiDocument, {
    onError: (error) => {
      console.error('GraphQL error:', error)
      setUploadError(error.message)
      setUploadSuccess(false)
    },
  })

  const {
    loading: loadingQuestions,
    error: errorQuestions,
    data: dataQuestions,
    refetch: refetchQuestions,
  } = useQuery(GetLatestNQuestionsDocument, { skip: true })

  const {
    loading: loadingHistory,
    error: errorHistory,
    data: dataHistory,
    refetch: refetchHistoryQuestions,
  } = useQuery(GetHistoryGeneratedQuestionsDocument, {
    variables: {
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    },
  })

  const {
    loading: loadingCount,
    error: errorCount,
    data: dataCount,
    refetch: refetchCount,
  } = useQuery(GetGeneratedQuestionsCountDocument)

  const validateSelections = () => {
    const errors: string[] = []
    if (!selectedType) errors.push(t('manage.aiRelate.noTypeError'))
    if (!selectedModel) errors.push(t('manage.aiRelate.noModelError'))
    if (!selectedLanguage) errors.push(t('manage.aiRelate.noLanguageError'))
    if (!difficultyLevel) errors.push(t('manage.aiRelate.noDifficultyError'))
    if (!numQuestions) errors.push(t('manage.aiRelate.noNumQError'))
    if (!selectedFile) errors.push(t('manage.aiRelate.noFileSelected'))

    return errors
  }

  // Calculate total pages
  const totalItems = dataCount?.getGeneratedQuestionsCount || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Update the state when dataQuestions is available
  useEffect(() => {
    if (dataQuestions && dataQuestions.latestNQuestions) {
      setQuestions(dataQuestions.latestNQuestions)
    }
  }, [dataQuestions])

  useEffect(() => {
    console.log('Complete DataHistory:', dataHistory)
    if (dataHistory && dataHistory.historyGeneratedQuestions) {
      setHistoryQuestions(dataHistory.historyGeneratedQuestions)
    }
  }, [dataHistory])

  // Handle the click event for "Generate Question" button
  const handleGenerateQuestions = async () => {
    if (!isFileUploaded) {
      setGenerateError(t('manage.aiRelate.noFileSelected'))
      setQuestionsGenerated(false)
      return
    }

    // const validationErrors = validateSelections()
    // if (validationErrors.length > 0) {
    //   setGenerateError(validationErrors.join(', '))
    //   setQuestionsGenerated(false)
    //   return // Stop calling API
    // }
    setIsGenerating(true)
    setGenerateError(null)
    setQuestions([]) //clear old data

    try {
      const response = await generatedQuestion({
        variables: {
          limit: Number(numQuestions),
          language: selectedLanguage || 'English',
          type: selectedType || 'Content',
          difficulty: difficultyLevel || 'EASY',
          model: selectedModel || 'OpenAI',
        },
      })
      console.log('Response:', response)
      if (response.data) {
        console.log('Questions successfully generated and stored')
        const { data } = await refetchQuestions({ limit: Number(numQuestions) })
        if (data && data.latestNQuestions) {
          setQuestions(data.latestNQuestions)
          setQuestionsGenerated(true)
          console.log('Questions successfully fetched')
        }
        await refetchHistoryQuestions()
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      if (error instanceof ApolloError) {
        const graphQLErrors = error.graphQLErrors
          .map((e) => e.message)
          .join(', ')
        const networkError = error.networkError?.message

        // Display GraphQL error
        if (graphQLErrors) {
          setGenerateError(`${graphQLErrors}, Please retry`)
        } else if (networkError) {
          setGenerateError(`${networkError}.Please retry`)
        } else {
          setGenerateError(t('manage.aiRelate.unexpectedError'))
        }
      } else {
        // Display not  ApolloError
        setGenerateError(
          `${error instanceof Error ? error.message : 'An unexpected error occurred'}. Please retry.`
        )
      }
      setQuestionsGenerated(false)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadSuccess(null)
    setUploadError(null)

    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]

      if (
        selectedFile &&
        selectedFile.name === file.name &&
        selectedFile.size === file.size
      ) {
        setFileChanged(false)
        setSelectedFile(file)
        setIsFileUploaded(false)
      } else {
        setSelectedFile(file)
        setFileChanged(true)
        setIsFileUploaded(false)
      }
    } else {
      setSelectedFile(null)
      setFileChanged(false)
      setUploadError(t('manage.aiRelate.noFileSelected'))
    }
  }

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

  //   const fileInput = event.target;
  //   fileInput.value = '';
  //   if (event.target.files && event.target.files.length > 0) {
  //     setSelectedFile(event.target.files[0])
  //     setUploadSuccess(null)
  //   }
  // }

  const fileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError(t('manage.aiRelate.noFileSelected'))
      setUploadSuccess(null)
      setIsFileUploaded(false)
      return
    }

    setUploadError(null)
    setUploadSuccess(null)
    setIsUploading(true)
    // const formData = new FormData()
    // formData.append('file', selectedFile)

    try {
      // const response = await fetch('https://manage.klicker-mp.bf-app.ch/ai/upload', {
      //   method: 'POST',
      //   body: formData,
      // })
      const base64String = await fileToBase64(selectedFile)
      const response = await uploadFile({
        variables: {
          file: base64String as string,
          filename: selectedFile.name,
        },
      })

      // If the data structure is unexpected, considerd as false
      if (response.errors || !response.data || !response.data.uploadFile) {
        // can be modified later
        const errorMessage = response.errors
          ? response.errors.map((e) => e.message).join(', ')
          : t('manage.aiRelate.fileFail')
        // Set error message
        setUploadError(errorMessage)
        setUploadSuccess(false)
        setIsFileUploaded(false)
        return
      }

      console.log('File successfully uploaded')
      setUploadSuccess(true)
      setUploadError(null)
      setIsFileUploaded(true)
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadError(
        `${error instanceof Error ? error.message : 'An unexpected error occurred'}. Please retry.`
      )
      setUploadSuccess(false)
      setIsFileUploaded(false)
    } finally {
      setIsUploading(false)
    }
  }

  const handleNumQuestionChange = (newValue: string) => {
    if (newValue === 'RANDOM') {
      const randomValue = Math.floor(Math.random() * 5) + 1 //random 1-5 numbers if choose random
      setNumQuestions(randomValue.toString())
    } else {
      setNumQuestions(newValue)
    }
  }

  const unsetDeletedQuestion = (questionId: number) => {
    setSelectedQuestions((prev) => {
      if (prev[questionId]) {
        const newSelectedQuestions = { ...prev }
        delete newSelectedQuestions[questionId]
        return newSelectedQuestions
      }
      return prev
    })
  }

  const handleTabSwitch = (tab: 'generating' | 'history') => {
    setActiveTab(tab) // switch tabs
    if (tab === 'history') {
      refetchHistoryQuestions()
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    refetchHistoryQuestions({
      limit: itemsPerPage,
      offset: (newPage - 1) * itemsPerPage,
    })
  }

  return (
    <PageSourceProvider isGeneratedPage={true}>
      <Layout
        displayName={t('manage.general.ai')}
        className={{ children: 'pb-2' }}
      >
        <div className="grid w-full flex-grow grid-cols-1 gap-12 lg:grid-cols-4">
          <div className="col-span-1">
            <H2>{t('manage.aiRelate.welcomeMessage')}</H2>

            <div className="mb-6">
              <Label
                label={t('manage.aiRelate.fileUpload')}
                className={{
                  root: 'mb-2 block text-sm font-semibold text-gray-700',
                }}
              />
              <input
                type="file"
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                onChange={handleFileChange}
              />
              <Button
                onClick={handleFileUpload}
                className={{
                  root: 'bg-primary-80 flex h-10 w-full items-center justify-center rounded-lg font-bold text-white transition hover:bg-blue-900',
                }}
              >
                <Button.Label>{t('manage.aiRelate.uploadFile')}</Button.Label>
              </Button>

              {/*Notification of file upload status*/}
              {isUploading && <Loader />}
              {uploadError && (
                <Label
                  label={`${t('shared.generic.error')}: ${uploadError}`}
                  className={{
                    root: 'mb-2 block text-sm font-semibold text-red-600',
                  }}
                />
              )}

              {uploadSuccess === true && !uploadError && (
                <Label
                  label={t('manage.aiRelate.fileSuccess')}
                  className={{
                    root: 'mb-2 block text-sm font-semibold text-green-600',
                  }}
                />
              )}
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <Label
                  label={t('manage.aiRelate.selectModel')}
                  className={{
                    root: 'mb-2 block text-sm font-semibold text-gray-700',
                  }}
                />

                <Select
                  items={[
                    {
                      label: 'OpenAI',
                      value: 'OpenAI',
                    },
                    {
                      label: 'Claude',
                      value: 'Claude',
                    },
                    // {
                    //     label: 'Llama',
                    //     value: 'Llama',
                    // },
                    // {
                    //     label: 'Gemini',
                    //     value: 'Gemini',
                    // }
                  ]}
                  onChange={(newValue) => {
                    setSelectedModel(newValue)
                  }}
                  className={{
                    trigger: 'w-full',
                  }}
                />
              </div>
              <div>
                <Label
                  label={t('manage.aiRelate.numQuestion')}
                  className={{
                    root: 'mb-2 block text-sm font-semibold text-gray-700',
                  }}
                />

                <Select
                  items={[
                    {
                      label: '2',
                      value: '2',
                    },
                    {
                      label: '5',
                      value: '5',
                    },
                    {
                      label: '10',
                      value: '10',
                    },
                    {
                      label: t('manage.aiRelate.random'),
                      value: 'RANDOM',
                    },
                  ]}
                  onChange={handleNumQuestionChange}
                  className={{
                    trigger: 'w-full',
                  }}
                />
              </div>

              <div>
                <Label
                  label={t('manage.general.setLanguage')}
                  className={{
                    root: 'mb-2 block text-sm font-semibold text-gray-700',
                  }}
                />

                <Select
                  items={[
                    {
                      label: t('manage.aiRelate.english'),
                      value: 'English',
                    },
                    {
                      label: t('manage.aiRelate.german'),
                      value: 'German',
                    },
                  ]}
                  onChange={(newValue) => {
                    setSelectedLanguage(newValue) // Update the state with the selected value
                  }}
                  className={{
                    trigger: 'w-full',
                  }}
                />
              </div>

              <div>
                <Label
                  label={t('manage.aiRelate.chooseType')}
                  className={{
                    root: 'mb-2 block text-sm font-semibold text-gray-700',
                  }}
                />

                <Select
                  items={[
                    {
                      label: t(`shared.${ElementType.Content}.typeLabel`),
                      value: ElementType.Content,
                    },
                    {
                      label: t(`shared.${ElementType.Flashcard}.typeLabel`),
                      value: ElementType.Flashcard,
                    },
                    {
                      label: t(`shared.${ElementType.Sc}.typeLabel`),
                      value: ElementType.Sc,
                    },
                    {
                      label: t(`shared.${ElementType.Mc}.typeLabel`),
                      value: ElementType.Mc,
                    },
                    {
                      label: t(`shared.${ElementType.Kprim}.typeLabel`),
                      value: ElementType.Kprim,
                    },
                    {
                      label: t(`shared.${ElementType.Numerical}.typeLabel`),
                      value: ElementType.Numerical,
                    },
                    {
                      label: t(`shared.${ElementType.FreeText}.typeLabel`),
                      value: ElementType.FreeText,
                    },
                    {
                      label: t('manage.aiRelate.random'),
                      value: 'RANDOM',
                    },
                  ]}
                  onChange={(newValue) => {
                    setSelectedType(newValue)
                  }}
                  className={{
                    trigger: 'w-full',
                  }}
                />
              </div>

              <div>
                <Label
                  label={t('manage.aiRelate.chooseDifficulty')}
                  className={{
                    root: 'mb-2 block text-sm font-semibold text-gray-700',
                  }}
                />

                <Select
                  items={[
                    {
                      label: t('shared.EASY.difficultyLabel'),
                      value: 'EASY',
                    },
                    {
                      label: t('shared.MEDIUM.difficultyLabel'),
                      value: 'MEDIUM',
                    },
                    {
                      label: t('shared.HARD.difficultyLabel'),
                      value: 'HARD',
                    },
                    {
                      label: t('manage.aiRelate.random'),
                      value: 'RANDOM',
                    },
                  ]}
                  onChange={(newValue) => {
                    setDifficultyLevel(newValue)
                  }}
                  className={{
                    trigger: 'w-full',
                  }}
                />
              </div>

              <Button
                onClick={handleGenerateQuestions}
                className={{
                  root: 'bg-primary-80 flex h-10 w-full items-center justify-center rounded-lg font-bold text-white transition hover:bg-blue-900',
                }}
              >
                {t('manage.aiRelate.genCap')}
              </Button>
            </div>
          </div>

          {/* The right sidebar code start here */}
          <div className="col-span-3 w-full border-l border-gray-300 pl-8">
            <H2>{t('manage.aiRelate.generatedQuestions')}</H2>

            {/* Tabs for switching between generating and history questions */}
            <div className="mb-4 flex border-b border-gray-300">
              <Button
                onClick={() => handleTabSwitch('generating')}
                active={activeTab === 'generating'}
                className={{
                  root: `px-4 py-2 ${activeTab === 'generating' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-600'}`,
                }}
              >
                <Button.Label>
                  {t('manage.aiRelate.generatingTab')}
                </Button.Label>
              </Button>

              <Button
                onClick={() => handleTabSwitch('history')}
                active={activeTab === 'history'}
                className={{
                  root: `px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-600'}`,
                }}
              >
                <Button.Label>{t('manage.aiRelate.historyTab')}</Button.Label>
              </Button>
            </div>

            {/* Render questions dynamically based on activeTab */}
            {activeTab === 'generating' &&
              (isGenerating ? (
                <Loader />
              ) : generateError ? (
                <Label
                  label={`${t('shared.generic.error')}: ${generateError}`}
                  className={{
                    root: 'mb-2 block text-sm font-semibold text-red-600',
                  }}
                />
              ) : errorQuestions ? (
                <div>
                  {t('shared.generic.error')}: {errorQuestions.message}
                </div>
              ) : questionsGenerated && !loadingQuestions ? (
                <QuestionList
                  questions={questions}
                  selectedQuestions={selectedQuestionData}
                  setSelectedQuestions={(id: number, data: Element) => {
                    setSelectedQuestions((prev) => {
                      const newSelectedQuestions = { ...prev }
                      if (prev[id]) {
                        delete newSelectedQuestions[id]
                      } else {
                        newSelectedQuestions[id] = data
                      }
                      return newSelectedQuestions
                    })
                  }}
                  handleTagClick={(tag: string) => {
                    console.log('Tag clicked:', tag)
                  }}
                  unsetDeletedQuestion={unsetDeletedQuestion}
                />
              ) : null)}

            {activeTab === 'history' &&
              (loadingHistory ? (
                <Loader />
              ) : errorHistory ? (
                <div>
                  {t('shared.generic.error')}: {errorHistory.message}
                </div>
              ) : dataHistory && dataHistory.historyGeneratedQuestions ? (
                <>
                  <QuestionList
                    questions={historyQuestions}
                    selectedQuestions={selectedQuestionData}
                    setSelectedQuestions={(id: number, data: Element) => {
                      setSelectedQuestions((prev) => {
                        const newSelectedQuestions = { ...prev }
                        if (prev[id]) {
                          delete newSelectedQuestions[id]
                        } else {
                          newSelectedQuestions[id] = data
                        }
                        return newSelectedQuestions
                      })
                    }}
                    handleTagClick={(tag: string) => {
                      console.log('Tag clicked:', tag)
                    }}
                    unsetDeletedQuestion={unsetDeletedQuestion}
                  />
                  {/* Control Pages */}
                  <div className="mt-4 flex items-center justify-between">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <Button.Label>
                        {t('manage.aiRelate.previous')}
                      </Button.Label>
                    </Button>
                    <Label
                      label={t('manage.aiRelate.page', {
                        currentPage: currentPage,
                        totalPages: totalPages,
                      })}
                      className={{
                        root: 'text-sm font-medium text-gray-700',
                      }}
                    />

                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <Button.Label>{t('manage.aiRelate.next')}</Button.Label>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-4 text-center">
                  <Label
                    label={t('manage.aiRelate.noHistory')}
                    className={{
                      root: 'text-xl font-bold text-gray-500',
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      </Layout>
    </PageSourceProvider>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`@klicker-uzh/i18n/messages/${locale}`)).default,
    },
  }
}
