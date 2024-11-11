import { useQuery } from '@apollo/client'
import Loader from '@klicker-uzh/shared-components/src/Loader'
import { GetStaticPropsContext } from 'next'
import { useTranslations } from 'next-intl'
import { useState, useEffect,useMemo } from 'react';
import { pickBy } from 'remeda';
import { PageSourceProvider } from 'src/pageContext/PageContext';
import { Button, Select, Label } from '@uzh-bf/design-system';
import Layout from '../../components/Layout'
import QuestionList from '../../components/questions/QuestionList'
import type { Element } from '@klicker-uzh/graphql/dist/ops'
import {
    GetLatestNQuestionsDocument,
    ElementType,
    UpdateElementGeneratedScoreDocument,

} from '@klicker-uzh/graphql/dist/ops';

export default function Home() {
    const t = useTranslations()

    //const [selectedQuestions, setSelectedQuestions] = useState<Record<number, Element>>({});
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
  

    const [selectedType, setSelectedType] = useState();
    const [numQuestions, setNumQuestions] = useState<string>('2');
    const [difficultyLevel, setDifficultyLevel] = useState<string>();
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [questionsGenerated, setQuestionsGenerated] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);

    const { loading: loadingQuestions, error: errorQuestions, data: dataQuestions, refetch: refetchQuestions } = useQuery(GetLatestNQuestionsDocument,
        {skip: true,}
    );

    // Update the state when dataQuestions is available
    useEffect(() => {
        if (dataQuestions && dataQuestions.latestNQuestions) {
            setQuestions(dataQuestions.latestNQuestions);
        }
    }, [dataQuestions]);

    // Handle the click event for "Generate Question" button
    const handleGenerateQuestions = async () => {
        try {
            const temp = Number(numQuestions);

            const { data } = await refetchQuestions({ limit: temp });
            if (data && data.latestNQuestions) {
                setQuestions(data.latestNQuestions);
                setQuestionsGenerated(true);
                console.log("Questions successfully fetched");
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
        // try {
        //     const response = await fetch('http://localhost:8000/generate', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ limit: numQuestions, language: selectedLanguage }),  // 发送生成问题的数量
        //     });
            
        //     if (response.ok) {
        //         console.log("Questions successfully generated and stored");
        //         const { data } = await refetchQuestions({ limit: numQuestions});
        //         if (data && data.latestNQuestions) {
        //             setQuestions(data.latestNQuestions);
        //             setQuestionsGenerated(true);
        //             console.log("Questions successfully fetched");
        //         }
        //     }   
            
        // } catch (error) {
        //     console.error('Error fetching questions:', error);
        // }
    };

    const handleNumQuestionChange = (newValue: string) =>{
        if (newValue === 'RANDOM') {
            const randomValue = Math.floor(Math.random() * 5) + 1; //random 1-5 numbers if choose random
            setNumQuestions(randomValue.toString());
          } else {
            setNumQuestions(newValue);
          }
        
    }

    const unsetDeletedQuestion = (questionId: number) => {
        setSelectedQuestions((prev) => {
            if (prev[questionId]) {
                const newSelectedQuestions = { ...prev };
                delete newSelectedQuestions[questionId];
                return newSelectedQuestions;
            }
            return prev;
        });
    };


    const handleTypeChange = (newValue: string) => {
        setSelectedType(newValue as ElementType);
    };


    return (
        <PageSourceProvider isGeneratedPage={true}> 
        <Layout
            displayName={t('manage.general.ai')}
            className={{ children: 'pb-2' }}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 w-full flex-grow">
                <div className="col-span-1">
                    <div className="mb-6">
                        <Label
                            label={t('manage.aiRelate.welcomeMessage')}
                            className={{
                                root: 'block mb-2 text-sm font-semibold text-gray-700',
                            }}
                        />
                    </div>

                    <div className="mb-6">
                        <Label
                            label={t('manage.aiRelate.fileUpload')}
                            className={{
                                root: 'block mb-2 text-sm font-semibold text-gray-700',
                            }}
                        />
                        <input
                            type="file"
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-violet-50 file:text-violet-700
                            hover:file:bg-violet-100"
                        />
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <Label
                                label={t('manage.aiRelate.numQuestion')}
                                className={{
                                    root: 'block mb-2 text-sm font-semibold text-gray-700',
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
                                        label: '15',
                                        value: '15',
                                    },
                                    {
                                        label: t('manage.aiRelate.random'),
                                        value: 'RANDOM',
                                    },
                                ]}
                                onChange={handleNumQuestionChange}
                            />
                        </div>

                        <div>
                            <Label
                                label={t('manage.general.setLanguage')}
                                className={{
                                    root: 'block mb-2 text-sm font-semibold text-gray-700',
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
                                    setSelectedLanguage(newValue); // Update the state with the selected value
                                }}

                            />

                        </div>

                        <div>
                            <Label
                                label={t('manage.aiRelate.chooseType')}
                                className={{
                                    root: "block mb-2 text-sm font-semibold text-gray-700",
                                }}
                            />

                            <Select
                                className={{
                                    root: "block mb-2 text-sm font-semibold text-gray-700",
                                }}

                                items={[
                                    {
                                        value: "Content",
                                        label: t(`shared.${ElementType.Content}.typeLabel`),
                                    },
                                    {
                                        value: "Flashcard",
                                        label: t(`shared.${ElementType.Flashcard}.typeLabel`),
                                    },
                                    {
                                        value: "SC",
                                        label: t(`shared.${ElementType.Sc}.typeLabel`),
                                    },
                                    {
                                        value: "MC",
                                        label: t(`shared.${ElementType.Mc}.typeLabel`),
                                    },
                                    {
                                        value: "Kprim",
                                        label: t(`shared.${ElementType.Kprim}.typeLabel`),
                                    },
                                    {
                                        value: "Numerical",
                                        label: t(`shared.${ElementType.Numerical}.typeLabel`),
                                    },
                                    {
                                        value: "FreeText",
                                        label: t(`shared.${ElementType.FreeText}.typeLabel`),
                                    },
                                    {
                                        label: t('manage.aiRelate.random'),
                                        value: "RANDOM",
                                    },

                                ]}
                                value={selectedType}
                                onChange={handleTypeChange}
                            />

                        </div>

                        <div>
                            <Label
                                label={t('manage.aiRelate.chooseDifficulty')}
                                className={{
                                    root: 'block mb-2 text-sm font-semibold text-gray-700',
                                }}
                            />

                            <Select
                                items={[
                                    {
                                        label: t('manage.aiRelate.easy'),
                                        value: 'Easy',
                                    },
                                    {
                                        label: t('manage.aiRelate.medium'),
                                        value: 'Medium',
                                    },
                                    {
                                        label: t('manage.aiRelate.hard'),
                                        value: 'Hard',
                                    },
                                    {
                                        label: t('manage.aiRelate.random'),
                                        value: "RANDOM",
                                    },
                                ]}
                                onChange={(newValue) => {
                                    setDifficultyLevel(newValue);
                                }}

                            />
                        </div>

                        <Button
                            onClick={handleGenerateQuestions}
                            className={{
                                root: "w-full py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition",
                            }}
                        >
                            {t('manage.aiRelate.genCap')}
                        </Button>
                    </div>
                </div>

                {/* The right sidebar code start here */}
                <div className="col-span-3 pl-8 border-l border-gray-300 w-full">
                    <div className="mb-4">
                        <Label
                            label={t('manage.aiRelate.generatedQuestions')}
                            className={{
                                root: 'text-xl font-bold',
                            }}
                        />
                    </div>
                    {loadingQuestions && <Loader />}
                    {errorQuestions && <div>Error: {errorQuestions.message}</div>}
                    {questionsGenerated && !loadingQuestions && (
                        <QuestionList
                            questions={questions}
                            selectedQuestions={selectedQuestionData}
                            setSelectedQuestions={(id: number, data: Element) => {
                                setSelectedQuestions((prev) => {
                                    const newSelectedQuestions = { ...prev };
                                    if (prev[id]) {
                                        delete newSelectedQuestions[id];
                                    } else {
                                        newSelectedQuestions[id] = data;
                                    }
                                    return newSelectedQuestions;
                                
                                });
                            }}
                            handleTagClick={(tag: string) => {
                                console.log('Tag clicked:', tag);
                            }}
                            unsetDeletedQuestion={unsetDeletedQuestion}
                        

        
                        />
                    )}
                    </div>
                </div>

        </Layout>
        </PageSourceProvider>

    );
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
    return {
        props: {
            messages: (await import(`@klicker-uzh/i18n/messages/${locale}`)).default,
        },
    };
}
