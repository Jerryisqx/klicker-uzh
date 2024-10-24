import {
  ElementInstanceType,
  ElementType,
  PrismaClient,
  ResponseCorrectness,
} from '../prisma/client'

async function run() {
  const prisma = new PrismaClient()
  const debug = false

  let counter = 0
  let updateCounter = 0

  // ! Fetch all element instances separated by type
  const rawInstances = await prisma.elementInstance.findMany({
    include: { responses: true, element: true, instanceStatistics: true },
  })
  const instances = rawInstances.filter((instance) => {
    const statistics = instance.instanceStatistics
    if (!statistics) {
      throw new Error(`Instance ${instance.id} has no statistics`)
    }

    const responseSum =
      (statistics.anonymousCorrectCount ?? 0) +
      (statistics.anonymousPartialCorrectCount ?? 0) +
      (statistics.anonymousWrongCount ?? 0) +
      statistics.correctCount +
      statistics.partialCorrectCount +
      statistics.wrongCount

    return responseSum === 0
  })

  // ! Update the instances with the statistics based on responses
  for (const instance of instances) {
    counter = counter + 1
    console.log(
      `Processing instance ${counter}/${instances.length} with id ${instance.id}`
    )

    // Summarize personal responses
    const isPracticeQuiz = instance.type === ElementInstanceType.PRACTICE_QUIZ
    const {
      totalResponseTime,
      correctCount,
      partialCount,
      wrongCount,
      firstCorrectCount,
      firstPartialCount,
      firstWrongCount,
      lastCorrectCount,
      lastPartialCount,
      lastWrongCount,
    } = instance.responses.reduce(
      (acc, response) => {
        // ! Accumulate total time spent on instance and correctness counts
        acc.totalResponseTime += response.averageTimeSpent
        acc.correctCount += response.correctCount
        acc.partialCount += response.partialCorrectCount
        acc.wrongCount += response.wrongCount

        // (for practice quizzes only) set first and last correctness counts
        if (isPracticeQuiz) {
          acc.firstCorrectCount += Number(
            response.firstResponseCorrectness === ResponseCorrectness.CORRECT
          )
          acc.firstPartialCount += Number(
            response.firstResponseCorrectness === ResponseCorrectness.PARTIAL
          )
          acc.firstWrongCount += Number(
            response.firstResponseCorrectness === ResponseCorrectness.WRONG
          )
          acc.lastCorrectCount += Number(
            response.lastResponseCorrectness === ResponseCorrectness.CORRECT
          )
          acc.lastPartialCount += Number(
            response.lastResponseCorrectness === ResponseCorrectness.PARTIAL
          )
          acc.lastWrongCount += Number(
            response.lastResponseCorrectness === ResponseCorrectness.WRONG
          )
        }

        return acc
      },
      {
        totalResponseTime: 0,
        correctCount: 0,
        partialCount: 0,
        wrongCount: 0,
        firstCorrectCount: 0,
        firstPartialCount: 0,
        firstWrongCount: 0,
        lastCorrectCount: 0,
        lastPartialCount: 0,
        lastWrongCount: 0,
      }
    )

    // update the instance statistics based on the accumulated data
    const totalUniqueParticipants = instance.responses.length
    const averageInstanceTime = totalUniqueParticipants
      ? totalResponseTime / totalUniqueParticipants
      : 0

    if (debug) {
      console.log('RESPONSES')
      console.log(instance.responses)
      console.log('STATISTICS')
      console.log('Correct count:', correctCount)
      console.log('Partial count:', partialCount)
      console.log('Wrong count:', wrongCount)
      console.log('First correct count:', firstCorrectCount)
      console.log('First partial count:', firstPartialCount)
      console.log('First wrong count:', firstWrongCount)
      console.log('Last correct count:', lastCorrectCount)
      console.log('Last partial count:', lastPartialCount)
      console.log('Last wrong count:', lastWrongCount)
      console.log('Unique participants:', totalUniqueParticipants)
      console.log('Average time spent:', averageInstanceTime)
    }

    // ! Compute anonymous correctness counts
    let anonymousCorrectCount = 0
    let anonymousPartialCorrectCount = 0
    let anonymousWrongCount = 0
    switch (instance.elementData.type) {
      case ElementType.FLASHCARD:
        anonymousCorrectCount = instance.anonymousResults['CORRECT']
        anonymousPartialCorrectCount = instance.anonymousResults['PARTIAL']
        anonymousWrongCount = instance.anonymousResults['INCORRECT']

        if (
          anonymousCorrectCount +
            anonymousPartialCorrectCount +
            anonymousWrongCount !==
          instance.anonymousResults['total']
        ) {
          throw new Error(
            `Anonymous results computed for flashcard instance ${instance.id} are inconsistent`
          )
        }
        break

      case ElementType.CONTENT:
        anonymousCorrectCount = instance.anonymousResults['total']
        break

      case ElementType.SC:
        const correctAnswerIndex =
          instance.elementData.options.choices.findIndex(
            (choice) => choice.correct
          )
        const correctAnswerIx = instance.elementData.hasSampleSolution
          ? instance.elementData.options.choices[correctAnswerIndex].ix
          : -1

        //check how many of the anonymous responses are equal to correctAnswerIx and the other way around
        const { tempCorrect1, tempIncorrect1 } = Object.entries(
          instance.anonymousResults.choices
        ).reduce(
          (acc, [ix, count]) => {
            if (ix === correctAnswerIx) {
              acc.tempCorrect1 += count as number
            } else {
              acc.tempIncorrect1 += count as number
            }

            return acc
          },
          { tempCorrect1: 0, tempIncorrect1: 0 }
        )

        anonymousCorrectCount = tempCorrect1
        anonymousWrongCount = tempIncorrect1
        break

      case ElementType.NUMERICAL:
      case ElementType.FREE_TEXT:
        const { tempCorrect2, tempIncorrect2 } = Object.entries(
          instance.anonymousResults.responses
        ).reduce(
          (acc, [_, response]) => {
            acc.tempCorrect2 += Number(response.correct)
            acc.tempIncorrect2 += Number(!response.correct)
            return acc
          },
          { tempCorrect2: 0, tempIncorrect2: 0 }
        )

        anonymousCorrectCount = tempCorrect2
        anonymousWrongCount = tempIncorrect2
        break

      case ElementType.MC:
      case ElementType.KPRIM:
        console.log(
          'Anonymous results for MC/KPRIM cannot be recovered, the corresponding counts are set to 0'
        )
        anonymousCorrectCount = 0
        anonymousPartialCorrectCount = 0
        anonymousWrongCount = 0
        break

      default:
        throw new Error(`Unknown element type ${instance.elementData.type}`)
    }

    if (debug) {
      console.log('ELEMENT DATA')
      console.log(instance.elementData.options)
      console.log('ANONYMOUS RESULTS')
      console.log(instance.anonymousResults)
      console.log('Correct count:', anonymousCorrectCount)
      console.log('Partial count:', anonymousPartialCorrectCount)
      console.log('Wrong count:', anonymousWrongCount)
    }

    // update the instance statistics
    await prisma.elementInstance.update({
      where: { id: instance.id },
      data: {
        instanceStatistics: {
          update: {
            // set correctness counts for all statistics with responses
            correctCount,
            partialCorrectCount: partialCount,
            wrongCount,

            // set first and last correctness counts for practice quiz
            firstCorrectCount: isPracticeQuiz ? firstCorrectCount : undefined,
            firstPartialCorrectCount: isPracticeQuiz
              ? firstPartialCount
              : undefined,
            firstWrongCount: isPracticeQuiz ? firstWrongCount : undefined,
            lastCorrectCount: isPracticeQuiz ? lastCorrectCount : undefined,
            lastPartialCorrectCount: isPracticeQuiz
              ? lastPartialCount
              : undefined,
            lastWrongCount: isPracticeQuiz ? lastWrongCount : undefined,

            // update anonymous correctness counts
            anonymousCorrectCount,
            anonymousPartialCorrectCount,
            anonymousWrongCount,

            // set average time spent on instance and total unique participants
            uniqueParticipantCount: totalUniqueParticipants,
            averageTimeSpent: averageInstanceTime,
          },
        },
      },
    })
    updateCounter = updateCounter + 1
  }

  console.log(`Updated ${updateCounter} instances in total`)
}

await run()
