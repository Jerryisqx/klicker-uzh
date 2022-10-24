import * as R from 'ramda'
import { ContextWithOptionalUser, ContextWithUser } from '../lib/context'

export async function getBasicCourseInformation(
  { courseId }: { courseId: string },
  ctx: ContextWithOptionalUser
) {
  const course = await ctx.prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course) {
    return null
  }
  return R.pick(['id', 'name', 'displayName', 'description', 'color'], course)
}

export async function joinCourseWithPin(
  { courseId, pin }: { courseId: string; pin: number },
  ctx: ContextWithUser
) {
  const course = await ctx.prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course || course.pinCode !== pin) {
    return null
  }

  // update the participants participations and set the newest one to be active
  const updatedParticipant = await ctx.prisma.participant.update({
    where: { id: ctx.user.sub },
    data: {
      participations: {
        connectOrCreate: {
          where: {
            courseId_participantId: { courseId, participantId: ctx.user.sub },
          },
          create: { course: { connect: { id: courseId } }, isActive: true },
        },
      },
    },
  })

  return updatedParticipant
}

interface JoinCourseArgs {
  courseId: string
}

export async function joinCourse(
  { courseId }: JoinCourseArgs,
  ctx: ContextWithUser
) {
  const participation = ctx.prisma.participation.upsert({
    where: {
      courseId_participantId: {
        courseId,
        participantId: ctx.user.sub,
      },
    },
    create: {
      isActive: true,
      course: {
        connect: {
          id: courseId,
        },
      },
      participant: {
        connect: {
          id: ctx.user.sub,
        },
      },
    },
    update: {
      isActive: true,
    },
  })

  return {
    id: `${courseId}-${ctx.user.sub}`,
    participation,
  }
}

interface LeaveCourseArgs {
  courseId: string
}

export async function leaveCourse(
  { courseId }: LeaveCourseArgs,
  ctx: ContextWithUser
) {
  const participation = ctx.prisma.participation.update({
    where: {
      courseId_participantId: {
        courseId,
        participantId: ctx.user.sub,
      },
    },
    data: {
      isActive: false,
    },
  })

  return {
    id: `${courseId}-${ctx.user.sub}`,
    participation,
  }
}

interface GetCourseOverviewDataArgs {
  courseId: string
}

export async function getCourseOverviewData(
  { courseId }: GetCourseOverviewDataArgs,
  ctx: ContextWithOptionalUser
) {
  if (ctx.user?.sub) {
    const participation = await ctx.prisma.participation.findUnique({
      where: {
        courseId_participantId: {
          courseId,
          participantId: ctx.user.sub,
        },
      },
      include: {
        course: {
          include: {
            participantGroups: true,
          },
        },
        participant: true,
        courseLeaderboard: true,
      },
    })

    const course = ctx.prisma.course.findUnique({
      where: { id: courseId },
    })

    const lbEntries = await course.leaderboard({
      where: {
        participation: { isActive: true },
      },
      include: {
        participant: true,
      },
    })

    if (participation) {
      const allEntries = lbEntries.reduce(
        (acc, entry) => {
          return {
            mapped: [
              ...acc.mapped,
              {
                id: entry.id,
                score: entry.score,
                username: entry.participant.username,
                avatar: entry.participant.avatar,
                participantId: entry.participant.id,
                isSelf: ctx.user?.sub === entry.participant.id,
              },
            ],
            sum: acc.sum + entry.score ?? 0,
            count: acc.count + 1,
          }
        },
        {
          mapped: [],
          sum: 0,
          count: 0,
        }
      )

      const allGroupEntries = participation.course.participantGroups.reduce(
        (acc, group, ix) => {
          return {
            mapped: [
              ...acc.mapped,
              {
                ...group,
                score: group.averageMemberScore + group.groupActivityScore,
                rank: ix + 1,
              },
            ],
            count: acc.count + 1,
            sum: acc.sum + group.averageMemberScore + group.groupActivityScore,
          }
        },
        {
          mapped: [],
          count: 0,
          sum: 0,
        }
      )

      const sortByScoreAndUsername = R.curry(R.sortWith)([
        R.descend(R.prop('score')),
        R.ascend(R.prop('username')),
      ])

      const sortedEntries = sortByScoreAndUsername(allEntries.mapped)
      const sortedGroupEntries = sortByScoreAndUsername(allGroupEntries.mapped)

      const filteredEntries = sortedEntries.flatMap((entry, ix) => {
        if (ix < 10 || entry.participantId === ctx.user?.sub)
          return { ...entry, rank: ix + 1 }
        return []
      })

      return {
        id: `${courseId}-${participation.participant.id}`,
        course: participation.course,
        participant: participation.participant,
        participation,
        leaderboard: filteredEntries,
        leaderboardStatistics: {
          participantCount: allEntries.count,
          averageScore:
            allEntries.count > 0 ? allEntries.sum / allEntries.count : 0,
        },
        groupLeaderboard: sortedGroupEntries,
        groupLeaderboardStatistics: {
          participantCount: allGroupEntries.count,
          averageScore:
            allGroupEntries.count > 0
              ? allGroupEntries.sum / allGroupEntries.count
              : 0,
        },
      }
    }
  }

  const course = await ctx.prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course) return null

  let participant = null
  if (ctx.user?.sub) {
    participant = await ctx.prisma.participant.findUnique({
      where: { id: ctx.user.sub },
    })
  }

  return {
    id: `${courseId}-${participant?.id}`,
    course,
    participant,
    participation: null,
    leaderboard: [],
  }
}

interface CreateCourseArgs {
  name: string
  displayName?: string
  color?: string
}

export async function createCourse(
  { name, displayName, color }: CreateCourseArgs,
  ctx: ContextWithUser
) {
  return ctx.prisma.course.create({
    data: {
      name,
      displayName: displayName ?? name,
      color,
      owner: {
        connect: { id: ctx.user.sub },
      },
    },
  })
}
