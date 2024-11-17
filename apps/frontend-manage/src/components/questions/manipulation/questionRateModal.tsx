import React, { useState } from 'react';
import { Modal, H2, H3, Label, Button } from '@uzh-bf/design-system'; 
import { useMutation } from '@apollo/client';
import { RateQuestionDocument } from '@klicker-uzh/graphql/dist/ops';
import { useTranslations } from 'next-intl'

interface RatingModalProps {
  isOpen: boolean;
  handleSetIsOpen: (open: boolean) => void;
  questionId?: number;
  handleRatingCompleted: () => void;
}

function RatingModal({ isOpen, handleSetIsOpen, questionId, handleRatingCompleted}: RatingModalProps): React.ReactElement {
  const [helpfulness, setHelpfulness] = useState(3);
  const [difficultyRate, setDifficultyRate] = useState(3);
  const [typeRate, setTypeRate] = useState(3);
  const [relevance, setRelevance] = useState(3);

  const [rateQuestion, { loading }] = useMutation(RateQuestionDocument);

  const t = useTranslations()

  const handleSubmit = async () => {
    if (!questionId) {
      console.error('Question ID is required for rating');
      return;
    }

    try {
      await rateQuestion({
        variables: {
          id: questionId,
          helpfulness,
          difficultyRate,
          typeRate,
          relevance,
        },
      });
      console.log('Rating submitted successfully');
      handleRatingCompleted();  
      handleSetIsOpen(false);  
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => handleSetIsOpen(false)}
      title={t('manage.aiRelate.rate')}
    >
      <H2>{t('manage.aiRelate.help')}</H2>
      
      <H3>{t('manage.aiRelate.extent')}</H3>

      <div className="mb-4">
        <Label
          label={t('manage.aiRelate.helpEval')}
            className={{
            root: 'block mb-2 text-sm font-semibold text-gray-700',
            }}
        />
        <div className = "flex items-center space-x-4" onChange={(e) => setHelpfulness(Number((e.target as HTMLInputElement).value))}>
        {[
            { value: 1, label:  t('manage.aiRelate.strongDisagree')},
            { value: 2, label: t('manage.aiRelate.disagree')},
            { value: 3, label: t('manage.aiRelate.neutral')},
            { value: 4, label: t('manage.aiRelate.agree')},
            { value: 5, label: t('manage.aiRelate.strongAgree')},
        ].map(({ value, label }) => (
            <label key={value} className="flex items-center space-x-2">
                <input
                    type="radio"
                    value={value}
                    checked={helpfulness === value}
                    className="mr-1"
                />
                <span>{label}</span>
            </label>
        ))}
        </div>
      </div>

      <div className="mb-4">
      <Label
          label={t('manage.aiRelate.diffEval')}
            className={{
            root: 'block mb-2 text-sm font-semibold text-gray-700',
            }}
        />
        <div className = "flex items-center space-x-4" onChange={(e) => setDifficultyRate(Number((e.target as HTMLInputElement).value))}>
        {[
            { value: 1, label:  t('manage.aiRelate.strongDisagree')},
            { value: 2, label: t('manage.aiRelate.disagree')},
            { value: 3, label: t('manage.aiRelate.neutral')},
            { value: 4, label: t('manage.aiRelate.agree')},
            { value: 5, label: t('manage.aiRelate.strongAgree')},
        ].map(({ value, label }) => (
            <label key={value} className="flex items-center space-x-2">
                <input
                    type="radio"
                    value={value}
                    checked={difficultyRate === value}
                    className="mr-1"
                />
                <span>{label}</span>
            </label>
        ))}
        </div>
      </div>

      <div className="mb-4">
      <Label
          label={t('manage.aiRelate.typeEval')}
            className={{
            root: 'block mb-2 text-sm font-semibold text-gray-700',
            }}
        />
        <div className = "flex items-center space-x-4" onChange={(e) => setTypeRate(Number((e.target as HTMLInputElement).value))}>
        {[
            { value: 1, label:  t('manage.aiRelate.strongDisagree')},
            { value: 2, label: t('manage.aiRelate.disagree')},
            { value: 3, label: t('manage.aiRelate.neutral')},
            { value: 4, label: t('manage.aiRelate.agree')},
            { value: 5, label: t('manage.aiRelate.strongAgree')},
        ].map(({ value, label }) => (
            <label key={value} className="flex items-center space-x-2">
                <input
                    type="radio"
                    value={value}
                    checked={typeRate === value}
                    className="mr-1"
                />
                <span>{label}</span>
            </label>
        ))}
        </div>
      </div>

      <div className="mb-4">
      <Label
          label={t('manage.aiRelate.relaEval')}
            className={{
            root: 'block mb-2 text-sm font-semibold text-gray-700',
            }}
        />
        <div className = "flex items-center space-x-4" onChange={(e) => setRelevance(Number((e.target as HTMLInputElement).value))}>
        {[
            { value: 1, label:  t('manage.aiRelate.strongDisagree')},
            { value: 2, label: t('manage.aiRelate.disagree')},
            { value: 3, label: t('manage.aiRelate.neutral')},
            { value: 4, label: t('manage.aiRelate.agree')},
            { value: 5, label: t('manage.aiRelate.strongAgree')},
        ].map(({ value, label }) => (
            <label key={value} className="flex items-center space-x-2">
                <input
                    type="radio"
                    value={value}
                    checked={relevance === value}
                    className="mr-1"
                />
                <span>{label}</span>
            </label>
        ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
      <Button
          className={{
            root: "py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition",
          }}
          onClick={handleSubmit}
          disabled={loading}
          loading={loading}
      >
        <Button.Label>
         {t('shared.generic.submit')}
        </Button.Label>
      </Button>

      <Button
        onClick={() => handleSetIsOpen(false)}
        className={{
          root: 'py-2 px-4 rounded bg-gray-200 hover:bg-gray-300',
        }}
      >
        <Button.Label>{t('shared.generic.cancel')}</Button.Label>
      </Button>

      </div>
    </Modal>
  );
}

export default RatingModal;
