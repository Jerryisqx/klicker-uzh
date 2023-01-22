import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ThemeContext } from '@uzh-bf/design-system'
import { useContext } from 'react'
import { useDrop } from 'react-dnd'
import { twMerge } from 'tailwind-merge'

interface AddQuestionFieldProps {
  push: (value: any) => void
}

function AddQuestionField({ push }: AddQuestionFieldProps) {
  const theme = useContext(ThemeContext)
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'question',
      drop: (item: {
        id: number
        type: string
        questionType: string
        title: string
        content: string
      }) => {
        push({
          id: item.id,
          title: item.title,
        })
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    []
  )

  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center rounded text-center border border-solid w-16 p-2',
        isOver && theme.primaryBg
      )}
      id="add-question"
      ref={drop}
    >
      <FontAwesomeIcon icon={faPlus} size="lg" />
      <div>Neue Frage</div>
    </div>
  )
}

export default AddQuestionField