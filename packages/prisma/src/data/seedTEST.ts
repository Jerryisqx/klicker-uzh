import Prisma from '../../dist/index.js'
import { type Element } from '../prisma/client/index.js'
import {
  COURSE_ID_TEST,
  COURSE_ID_TEST2,
  COURSE_ID_TEST3,
  USER_ID_TEST,
} from './constants.js'
import * as DATA_TEST from './data/TEST.js'
import {
  prepareContentElements,
  prepareCourse,
  prepareFlashcardsFromFile,
  prepareGroupActivityClues,
  prepareGroupActivityStack,
  prepareParticipant,
  prepareQuestion,
  prepareSession,
  prepareStackVariety,
} from './helpers.js'
import { seedAchievements } from './seedAchievements.js'
import { seedCompetencyTree } from './seedCompetencyTree.js'
import { seedEmailTemplates } from './seedEmailTemplates.js'
import { seedLevels } from './seedLevels.js'
import { seedUsers } from './seedUsers.js'

// uuids for 50 participants
export const PARTICIPANT_IDS = [
  '6f45065c-667f-4259-818c-c6f6b477eb48',
  '0b7c946c-cfc9-4b82-ac97-b058bf48924b',
  '52c20f0f-f5d4-4354-a5d6-a0c103f2b9ea',
  '16c39a69-03b4-4ce4-a695-e7b93d535598',
  'c48f624e-7de9-4e1b-a16d-82d22e64828f',
  '7cf9a94a-31a6-4c53-85d7-608dfa904e30',
  'f53e6a95-689b-48c0-bfab-6625c04f39ed',
  '46407010-0e7c-4903-9a66-2c8d9d6909b0',
  '84b0ba5d-34bc-45cd-8253-f3e8c340e5ff',
  '05a933a0-b2bc-4551-b7e1-6975140d996d',
  'bb822996-97d6-41e4-b648-d93057d1b49c',
  'abf8ddf8-f90d-4d29-af8b-6f007d41dd23',
  'de19e261-7848-4f4a-8992-e1e5db4b6825',
  'c9e11f3f-d485-4ed3-bd05-5eefedf4987f',
  '1b3ebc59-b93c-414d-a69e-cc2783221e28',
  '1b348636-d665-4618-9ed0-90ddb27a36b0',
  'e9c2e5da-0954-4970-a7c8-c752cb76b8df',
  '6283a267-1e66-4429-b7b8-3449d52ca87a',
  'f99c2387-56b6-407c-9b9a-19eba6bde857',
  '60f451a4-9005-4f08-90b6-3df7ff648aff',
  '2d7f7f11-c7ab-4223-acbf-c248c07a2e90',
  'd9fc5c24-4357-4a8f-ac5b-d56e6b22690d',
  '7013c323-12c5-45c4-8af4-40474bb08f27',
  'ef14f3c6-24b1-44eb-a464-63cede2255b3',
  'ed9e23c5-4187-48ba-9d73-07db86dbea08',
  '3e88cf14-7399-437a-addc-ef59087351de',
  'b155f01d-5bad-4378-9509-d96153b90d7e',
  '24e623bb-3d98-4a48-a2a0-f46b4dda4501',
  'ee6ff037-5d39-495b-ade3-295c23ed0cd7',
  '26544dd7-1688-43ec-9dba-8ed374c0a164',
  '30e328cd-f4c8-4c03-8e64-301fcffa410c',
  '783d3c6a-0a27-4caf-a2d3-ff30ec08e463',
  '13cda4e6-3971-4b70-b938-3f6afd936870',
  '7ac7ba41-f652-4218-b3b3-b5b11110c0e8',
  '88bfe576-5d29-4311-a699-e4f87bf82d7b',
  '794e1197-5aca-4354-a121-67c5ecb437a8',
  '7b6e18cb-346f-44e6-88fe-cc31d217b01b',
  '12099d4e-c36f-4e4d-bef7-f92496081129',
  '24f3192e-90e9-45b9-80f7-059eb683ec9a',
  'cbda0cb9-0c71-4efd-a2ef-b2c9eea60598',
  '03759c75-62e5-4f78-9ccc-4672d8f0a091',
  '9151b3c4-4e20-4b0c-8d44-2e7d274c1914',
  '2f726355-e304-4bb0-b2ad-b734a3b3603f',
  'f9b17cc1-d83a-4c3d-94f9-8a200bb8cd1b',
  '6bdd44c1-248b-4581-a971-6db8d2b24534',
  '1500f62b-4a56-4405-af08-4b12bb103ac1',
  '6c832cc9-17ab-4923-a7fc-c72cef128c31',
  '0c586267-55fb-4aba-9cb6-cee09cd737ae',
  'ec8952c2-2972-4160-ad90-3ecf96425f8d',
  'b687a300-b5e7-43dd-a49e-aea9ff30aadc',
]

// uuids for 14 participant groups
export const PARTICIPANT_GROUP_IDS = [
  '9c4940c1-87ca-47a7-afc4-cd85656df3e7',
  '4fc5c849-5a2b-437c-a6fd-91daac4e556a',
  '0de95dcb-1802-47f7-9fb9-01085d1d2281',
  '6f4ae38f-5866-4d24-8844-cd380998591c',
  'e91fe13f-4394-496f-b12f-993f9a1a8dba',
  'ac6a7361-f71e-4fcd-821f-8904954af90f',
  'f30a99f8-3d66-4f28-8aaf-af64b392de05',
  'e5ddf45a-89e3-466a-9d17-e60354470925',
  'fb1c3685-f51e-4585-8444-dbbe2ddb76a4',
  'f2f843c6-a35e-46d7-9574-902e1d134d6c',
  'd822a233-c6d4-4cb5-a7b8-4a265d7ffaa0',
  '7d9571fd-fdf4-4392-8293-768539896c09',
  '278057ff-f1c2-49a0-9ab1-bcbc4c6473b7',
  '11c06c89-0cb4-4d8e-b052-b711f327b8c4',
]

async function seedTest(prisma: Prisma.PrismaClient) {
  if (process.env.ENV !== 'development') process.exit(1)

  await seedLevels(prisma)
  await seedAchievements(prisma)
  await seedUsers(prisma)
  await seedCompetencyTree(prisma)
  await seedEmailTemplates(prisma)

  const courseTest = await prisma.course.upsert(
    prepareCourse({
      id: COURSE_ID_TEST,
      name: 'Testkurs',
      displayName: 'Testkurs',
      description: 'Das ist ein Testkurs. Hier wird getestet. Viel Spass!',
      isGamificationEnabled: true,
      ownerId: USER_ID_TEST,
      color: '#016272',
      pinCode: 123456789,
      startDate: new Date('2020-01-01T00:00'),
      endDate: new Date('2050-01-01T23:59'),
      isGroupCreationEnabled: true,
      groupDeadlineDate: new Date('2021-01-01T00:01'),
      maxGroupSize: 5,
      preferredGroupSize: 3,
      notificationEmail: process.env.NOTIFICATION_EMAIL as string,
    })
  )

  const courseTest2 = await prisma.course.upsert(
    prepareCourse({
      id: COURSE_ID_TEST2,
      name: 'Testkurs 2',
      displayName: 'Testkurs 2',
      description: 'Das ist ein Testkurs. Hier wird getestet. Abrakadabra!',
      isGamificationEnabled: true,
      ownerId: USER_ID_TEST,
      color: '#ff0000',
      pinCode: 987654321,
      startDate: new Date('2023-01-01T00:00'),
      endDate: new Date('2024-01-01T23:59'),
      isGroupCreationEnabled: true,
      groupDeadlineDate: new Date('2024-01-01T00:01'),
      maxGroupSize: 5,
      preferredGroupSize: 3,
      notificationEmail: process.env.NOTIFICATION_EMAIL as string,
    })
  )

  const courseTest3 = await prisma.course.upsert(
    prepareCourse({
      id: COURSE_ID_TEST3,
      name: 'Non-Gamified Course',
      displayName: 'Non-Gamified Course',
      description: 'This is a course without gamification.',
      isGamificationEnabled: false,
      ownerId: USER_ID_TEST,
      color: '#166b16',
      pinCode: 482748273,
      startDate: new Date('2023-01-01T00:00'),
      endDate: new Date('2030-01-01T23:59'),
      isGroupCreationEnabled: false,
      groupDeadlineDate: new Date('2025-01-01T00:01'),
      maxGroupSize: 5,
      preferredGroupSize: 3,
      notificationEmail: process.env.NOTIFICATION_EMAIL as string,
    })
  )

  const questionsTest = (await Promise.all(
    DATA_TEST.QUESTIONS.map((data) =>
      prisma.element.upsert(prepareQuestion({ ownerId: USER_ID_TEST, ...data }))
    )
  )) as Element[]

  // ----- LEGACY SEED -----
  const sessionsTest = await Promise.all(
    DATA_TEST.SESSIONS.map(async (data) =>
      prisma.liveSession.upsert(
        await prepareSession({
          ...data,
          status: data.status ?? 'PREPARED',
          blocks: data.blocks.map((block, ix) => ({
            order: ix,
            expiresAt: undefined,
            timeLimit: block.timeLimit,
            questions: questionsTest.filter((q) =>
              block.questions.includes(parseInt(q.originalId!))
            ),
          })),
          ownerId: USER_ID_TEST,
          courseId: COURSE_ID_TEST,
        })
      )
    )
  )

  // create participants
  const participantsTesting = await Promise.all(
    PARTICIPANT_IDS.map(async (id, ix) => {
      return prisma.participant.upsert(
        await prepareParticipant({
          id,
          password: 'abcdabcd',
          username: `testuser${ix + 1}`,
          courseIds: [COURSE_ID_TEST],
        })
      )
    })
  )

  // create participations for all the first 30 participants
  const participations = await Promise.all(
    PARTICIPANT_IDS.map(async (id, ix) => {
      return prisma.participation.upsert({
        where: {
          courseId_participantId: {
            courseId: COURSE_ID_TEST,
            participantId: id,
          },
        },
        create: {
          isActive: true,
          course: {
            connect: {
              id: COURSE_ID_TEST,
            },
          },
          participant: {
            connect: {
              id: id,
            },
          },
        },
        update: {
          isActive: true,
        },
      })
    })
  )

  // add participants 30 to 35 to single groups
  const PARTICIPANT_GROUP_IDS_SINGLE = [
    'af6758da-8667-43a3-9e7f-02fc1a441261',
    '6f7f65bb-84aa-4ec4-b52e-46b36d1c302b',
    'c07d7f8e-9299-4809-aed7-331cae09f347',
    '38de3f21-abb8-4982-a51d-e654f62ebe34',
    'd9f23367-32b9-45ba-9bd6-06b6d96a5829',
  ]
  const singleParticipantGroups = await Promise.all(
    PARTICIPANT_GROUP_IDS_SINGLE.map(async (id, ix) => {
      const code = 100000 + Math.floor(Math.random() * 900000)

      return prisma.participantGroup.upsert({
        where: {
          id,
        },
        create: {
          id,
          name: `Single Gruppe ${ix + 1}`,
          code: code,
          course: { connect: { id: COURSE_ID_TEST } },
          participants: {
            connect: [
              {
                id: PARTICIPANT_IDS[ix + 29],
              },
            ],
          },
          averageMemberScore: Math.round(ix * 100 + 500),
        },
        update: {
          name: `Single Gruppe ${ix + 1}`,
          code: code,
        },
      })
    })
  )

  // add the participants 30-50 to the random assignment pool
  const randomAssignmentPool = await Promise.all(
    PARTICIPANT_IDS.slice(35).map(async (id) => {
      return prisma.groupAssignmentPoolEntry.upsert({
        where: {
          courseId_participantId: {
            courseId: COURSE_ID_TEST,
            participantId: id,
          },
        },
        create: {
          course: {
            connect: {
              id: COURSE_ID_TEST,
            },
          },
          participant: {
            connect: {
              id: id,
            },
          },
        },
        update: {},
      })
    })
  )

  // create leaderboard entries for the top 15
  const leaderboardEntries = await Promise.all(
    PARTICIPANT_IDS.slice(0, 15).map(async (id, ix) => {
      return prisma.leaderboardEntry.upsert({
        where: {
          type_participantId_courseId: {
            type: 'COURSE',
            courseId: COURSE_ID_TEST,
            participantId: id,
          },
        },
        create: {
          type: 'COURSE',
          score: ix * 100 + 100,
          participant: {
            connect: {
              id: id,
            },
          },
          course: {
            connect: {
              id: COURSE_ID_TEST,
            },
          },
          participation: {
            connect: {
              courseId_participantId: {
                courseId: COURSE_ID_TEST,
                participantId: id,
              },
            },
          },
        },
        update: {},
      })
    })
  )

  // create participant groups
  const participantGroupsTesting = await Promise.all(
    PARTICIPANT_GROUP_IDS.map(async (id, ix) => {
      const code = 100000 + Math.floor(Math.random() * 900000)

      return prisma.participantGroup.upsert({
        where: {
          id,
        },
        create: {
          id,
          name: `Gruppe ${ix + 1}`,
          code: code,
          course: { connect: { id: COURSE_ID_TEST } },
          participants: {
            connect: [
              {
                id: PARTICIPANT_IDS[ix],
              },
              {
                id: PARTICIPANT_IDS[ix + PARTICIPANT_GROUP_IDS.length],
              },
            ],
          },
          averageMemberScore: Math.round(ix * 100 + 500),
        },
        update: {
          name: `Gruppe ${ix + 1}`,
          code: code,
        },
      })
    })
  )

  const participantsNoCourse = await Promise.all(
    [
      '908f84d0-fd32-4a99-8a9f-b4793288234d',
      'ec8385db-e951-47dc-9e86-e215b7e4c501',
    ].map(async (id, ix) => {
      return prisma.participant.upsert(
        await prepareParticipant({
          id,
          password: 'abcdabcd',
          username: `testuser${ix + PARTICIPANT_IDS.length + 1}`,
          courseIds: [],
        })
      )
    })
  )

  const awardedPilotAchievements = await Promise.all(
    PARTICIPANT_IDS.map(async (participantId) => {
      await prisma.participantAchievementInstance.upsert({
        where: {
          participantId_achievementId: {
            participantId: participantId,
            achievementId: DATA_TEST.AchievementIds.Explorer,
          },
        },
        create: {
          participant: {
            connect: {
              id: participantId,
            },
          },
          achievement: {
            connect: {
              id: DATA_TEST.AchievementIds.Explorer,
            },
          },
          achievedAt: new Date(),
          achievedCount: 1,
        },
        update: {},
      })
    })
  )

  const awardedAchievements = [
    DATA_TEST.AchievementIds['Busy Bee'],
    DATA_TEST.AchievementIds['Dream Team'],
    DATA_TEST.AchievementIds['Team Spirit'],
    DATA_TEST.AchievementIds.Fearless,
  ].map(async (achievementId) => {
    await prisma.participantAchievementInstance.upsert({
      where: {
        participantId_achievementId: {
          participantId: PARTICIPANT_IDS[0]!,
          achievementId: achievementId,
        },
      },
      create: {
        participant: {
          connect: {
            id: PARTICIPANT_IDS[0],
          },
        },
        achievement: {
          connect: {
            id: achievementId,
          },
        },
        achievedAt: new Date(),
        achievedCount: 1,
      },
      update: {},
    })
  })

  // seed practice quiz
  const flashcards = (await prepareFlashcardsFromFile(
    prisma,
    'data/FC_Modul_1.xml',
    USER_ID_TEST
  )) as Element[]

  // seed content elements
  const contentElements = (await prepareContentElements(
    prisma,
    {
      'Dummy Content Element 1':
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl euismod, aliquam nunc vita. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl euismod, aliquam nunc vita. Dummy Content 1',
      'Dummy Content Element 2':
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl euismod, aliquam nunc vita. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl euismod, aliquam nunc vita. Dummy Content 2',
      'Dummy Content Element 3':
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl euismod, aliquam nunc vita. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisl euismod, aliquam nunc vita. Dummy Content 3',
    },
    USER_ID_TEST
  )) as Element[]

  const groupActivityId1 = '99fe99d2-696c-46d7-b6ae-cf385879822a'
  const groupActivityPublished = await prisma.groupActivity.upsert({
    where: {
      id: groupActivityId1,
    },
    create: {
      id: groupActivityId1,
      name: 'Gruppenquest Published',
      displayName: 'Gruppenquest Published',
      description: `Description of the published group activity.`,
      status: Prisma.GroupActivityStatus.PUBLISHED,
      scheduledStartAt: new Date('2020-01-01T11:00:00.000Z'),
      scheduledEndAt: new Date('2030-01-01T11:00:00.000Z'),
      parameters: {},
      pointsMultiplier: 2,
      clues: {
        connectOrCreate: [
          ...prepareGroupActivityClues({ activityId: groupActivityId1 }),
        ],
      },
      stacks: {
        create: {
          ...prepareGroupActivityStack({
            migrationIdOffset: 0,
            flashcards,
            questions: questionsTest,
            contentElements,
            courseId: COURSE_ID_TEST,
          }),
        },
      },
      owner: {
        connect: {
          id: USER_ID_TEST,
        },
      },
      course: {
        connect: {
          id: COURSE_ID_TEST,
        },
      },
    },
    update: {},
  })

  const groupActivityId2 = 'c3e2e776-87fe-4b59-95dd-ac1977a411ba'
  const groupActivityScheduled = await prisma.groupActivity.upsert({
    where: {
      id: groupActivityId2,
    },
    create: {
      id: groupActivityId2,
      name: 'Gruppenquest Scheduled',
      displayName: 'Gruppenquest Scheduled',
      description: `Description of the scheduled group activity.`,
      status: Prisma.GroupActivityStatus.SCHEDULED,
      scheduledStartAt: new Date('2040-01-01T11:00:00.000Z'),
      scheduledEndAt: new Date('2050-01-01T11:00:00.000Z'),
      parameters: {},
      pointsMultiplier: 2,
      clues: {
        connectOrCreate: [
          ...prepareGroupActivityClues({ activityId: groupActivityId2 }),
        ],
      },
      stacks: {
        create: {
          ...prepareGroupActivityStack({
            migrationIdOffset: 100,
            flashcards,
            questions: questionsTest,
            contentElements,
            courseId: COURSE_ID_TEST,
          }),
        },
      },
      owner: {
        connect: {
          id: USER_ID_TEST,
        },
      },
      course: {
        connect: {
          id: COURSE_ID_TEST,
        },
      },
    },
    update: {},
  })

  const groupActivityId3 = '07e9847d-32bb-44a1-af49-de11a2151a92'
  const groupActivityDraft = await prisma.groupActivity.upsert({
    where: {
      id: groupActivityId3,
    },
    create: {
      id: groupActivityId3,
      name: 'Gruppenquest Draft',
      displayName: 'Gruppenquest Draft',
      description: `Description of the draft group activity.`,
      status: Prisma.GroupActivityStatus.DRAFT,
      scheduledStartAt: new Date('2020-01-01T11:00:00.000Z'),
      scheduledEndAt: new Date('2030-01-01T11:00:00.000Z'),
      pointsMultiplier: 2,
      parameters: {},
      clues: {
        connectOrCreate: [
          ...prepareGroupActivityClues({ activityId: groupActivityId3 }),
        ],
      },
      stacks: {
        create: {
          ...prepareGroupActivityStack({
            migrationIdOffset: 200,
            flashcards,
            questions: questionsTest,
            contentElements,
            courseId: COURSE_ID_TEST,
          }),
        },
      },
      owner: {
        connect: {
          id: USER_ID_TEST,
        },
      },
      course: {
        connect: {
          id: COURSE_ID_TEST,
        },
      },
    },
    update: {},
  })

  const groupActivityId4 = '89f84817-2669-42bb-9ca2-d643fdf72926'
  const groupActivityDraftPast = await prisma.groupActivity.upsert({
    where: {
      id: groupActivityId4,
    },
    create: {
      id: groupActivityId4,
      name: 'Gruppenquest Draft Past',
      displayName: 'Gruppenquest Draft Past',
      description: `Description of the draft group activity with a past end date.`,
      status: Prisma.GroupActivityStatus.DRAFT,
      scheduledStartAt: new Date('2020-01-01T11:00:00.000Z'),
      scheduledEndAt: new Date('2022-01-01T11:00:00.000Z'),
      pointsMultiplier: 2,
      parameters: {},
      clues: {
        connectOrCreate: [
          ...prepareGroupActivityClues({ activityId: groupActivityId4 }),
        ],
      },
      stacks: {
        create: {
          ...prepareGroupActivityStack({
            migrationIdOffset: 300,
            flashcards,
            questions: questionsTest,
            contentElements,
            courseId: COURSE_ID_TEST,
          }),
        },
      },
      owner: {
        connect: {
          id: USER_ID_TEST,
        },
      },
      course: {
        connect: {
          id: COURSE_ID_TEST,
        },
      },
    },
    update: {},
  })

  const groupActivityId5 = '8918501d-5e44-49d6-916e-43ba11794b96'
  const groupActivityCompleted = await prisma.groupActivity.upsert({
    where: {
      id: groupActivityId5,
    },
    create: {
      id: groupActivityId5,
      name: 'Gruppenquest Ended',
      displayName: 'Gruppenquest Ended',
      description: `Description of the completed group activity.`,
      status: Prisma.GroupActivityStatus.ENDED,
      scheduledStartAt: new Date('2020-01-01T11:00:00.000Z'),
      scheduledEndAt: new Date('2021-01-01T11:00:00.000Z'),
      parameters: {},
      pointsMultiplier: 2,
      clues: {
        connectOrCreate: [
          ...prepareGroupActivityClues({ activityId: groupActivityId5 }),
        ],
      },
      stacks: {
        create: {
          ...prepareGroupActivityStack({
            migrationIdOffset: 400,
            flashcards: [flashcards[0]!],
            questions: questionsTest,
            contentElements: [contentElements[0]!],
            courseId: COURSE_ID_TEST,
          }),
        },
      },
      owner: {
        connect: {
          id: USER_ID_TEST,
        },
      },
      course: {
        connect: {
          id: COURSE_ID_TEST,
        },
      },
    },
    update: {},
    include: {
      stacks: {
        include: {
          elements: true,
        },
      },
    },
  })

  const groupActivityId6 = '62f4511e-6760-4cef-9784-1814891a0f2b'
  const groupActivityGraded = await prisma.groupActivity.upsert({
    where: {
      id: groupActivityId6,
    },
    create: {
      id: groupActivityId6,
      name: 'Gruppenquest Graded',
      displayName: 'Gruppenquest Graded',
      description: `Description of the graded group activity.`,
      status: Prisma.GroupActivityStatus.GRADED,
      scheduledStartAt: new Date('2020-01-01T11:00:00.000Z'),
      scheduledEndAt: new Date('2021-01-01T11:00:00.000Z'),
      parameters: {},
      pointsMultiplier: 2,
      clues: {
        connectOrCreate: [
          ...prepareGroupActivityClues({ activityId: groupActivityId6 }),
        ],
      },
      stacks: {
        create: {
          ...prepareGroupActivityStack({
            migrationIdOffset: 500,
            flashcards: [flashcards[0]!],
            questions: questionsTest,
            contentElements: [contentElements[0]!],
            courseId: COURSE_ID_TEST,
          }),
        },
      },
      owner: {
        connect: {
          id: USER_ID_TEST,
        },
      },
      course: {
        connect: {
          id: COURSE_ID_TEST,
        },
      },
    },
    update: {},
    include: {
      stacks: {
        include: {
          elements: true,
        },
      },
    },
  })

  const groupActivityDecisions = groupActivityCompleted.stacks[0]!.elements.map(
    (element) => {
      const baseDecisions = {
        instanceId: element.id,
        type: element.elementType,
      }

      if (element.elementType === Prisma.ElementType.CONTENT) {
        return {
          ...baseDecisions,
          contentResponse: true,
        }
      } else if (element.elementType === Prisma.ElementType.SC) {
        return {
          ...baseDecisions,
          choicesResponse: [1],
        }
      } else if (element.elementType === Prisma.ElementType.MC) {
        return {
          ...baseDecisions,
          choicesResponse: [1, 2],
        }
      } else if (element.elementType === Prisma.ElementType.KPRIM) {
        return {
          ...baseDecisions,
          choicesResponse: [0, 1, 3],
        }
      } else if (element.elementType === Prisma.ElementType.FREE_TEXT) {
        return {
          ...baseDecisions,
          freeTextResponse: 'This is a free text response.',
        }
      } else if (element.elementType === Prisma.ElementType.NUMERICAL) {
        return {
          ...baseDecisions,
          numericalResponse: 10,
        }
      }
    }
  )

  const groupActivityDecisions2 =
    groupActivityCompleted.stacks[0]!.elements.map((element) => {
      const baseDecisions = {
        instanceId: element.id,
        type: element.elementType,
      }

      if (element.elementType === Prisma.ElementType.CONTENT) {
        return {
          ...baseDecisions,
          contentResponse: true,
        }
      } else if (element.elementType === Prisma.ElementType.SC) {
        return {
          ...baseDecisions,
          choicesResponse: [0, 2],
        }
      } else if (element.elementType === Prisma.ElementType.MC) {
        return {
          ...baseDecisions,
          choicesResponse: [0, 2],
        }
      } else if (element.elementType === Prisma.ElementType.KPRIM) {
        return {
          ...baseDecisions,
          choicesResponse: [0, 2],
        }
      } else if (element.elementType === Prisma.ElementType.FREE_TEXT) {
        return {
          ...baseDecisions,
          freeTextResponse: 'This is a new free text response.',
        }
      } else if (element.elementType === Prisma.ElementType.NUMERICAL) {
        return {
          ...baseDecisions,
          numericalResponse: 97,
        }
      }
    })

  const groupActivityDecisionsGraded =
    groupActivityGraded.stacks[0]!.elements.map((element) => {
      const baseDecisions = {
        instanceId: element.id,
        type: element.elementType,
      }

      if (element.elementType === Prisma.ElementType.CONTENT) {
        return {
          ...baseDecisions,
          contentResponse: true,
        }
      } else if (element.elementType === Prisma.ElementType.SC) {
        return {
          ...baseDecisions,
          choicesResponse: [1],
        }
      } else if (element.elementType === Prisma.ElementType.MC) {
        return {
          ...baseDecisions,
          choicesResponse: [1, 2],
        }
      } else if (element.elementType === Prisma.ElementType.KPRIM) {
        return {
          ...baseDecisions,
          choicesResponse: [0, 1, 3],
        }
      } else if (element.elementType === Prisma.ElementType.FREE_TEXT) {
        return {
          ...baseDecisions,
          freeTextResponse: 'This is a free text response.',
        }
      } else if (element.elementType === Prisma.ElementType.NUMERICAL) {
        return {
          ...baseDecisions,
          numericalResponse: 10,
        }
      }
    })

  // seed multiple group activity instance with decisions
  const groupActivityInstanceId = 1
  const groupActivityInstance = await prisma.groupActivityInstance.upsert({
    where: {
      id: groupActivityInstanceId,
    },
    create: {
      decisions: groupActivityDecisions,
      decisionsSubmittedAt: new Date('2020-06-01T11:00:00.000Z'),
      groupActivity: {
        connect: {
          id: groupActivityId5,
        },
      },
      group: {
        connect: {
          id: PARTICIPANT_GROUP_IDS[0],
        },
      },
    },
    update: {},
  })

  const groupActivityInstanceId2 = 2
  const groupActivityInstance2 = await prisma.groupActivityInstance.upsert({
    where: {
      id: groupActivityInstanceId2,
    },
    create: {
      decisions: groupActivityDecisions2,
      decisionsSubmittedAt: new Date('2020-06-10T11:00:00.000Z'),
      groupActivity: {
        connect: {
          id: groupActivityId5,
        },
      },
      group: {
        connect: {
          id: PARTICIPANT_GROUP_IDS[1],
        },
      },
    },
    update: {},
  })

  const groupActivityInstanceId3 = 3
  const groupActivityInstance3 = await prisma.groupActivityInstance.upsert({
    where: {
      id: groupActivityInstanceId3,
    },
    create: {
      decisions: groupActivityDecisions,
      decisionsSubmittedAt: new Date('2020-06-20T11:00:00.000Z'),
      groupActivity: {
        connect: {
          id: groupActivityId5,
        },
      },
      group: {
        connect: {
          id: PARTICIPANT_GROUP_IDS[2],
        },
      },
    },
    update: {},
  })

  // seed group activity instance without results
  const groupActivityInstanceId4 = 4
  const groupActivityInstance4 = await prisma.groupActivityInstance.upsert({
    where: {
      id: groupActivityInstanceId4,
    },
    create: {
      groupActivity: {
        connect: {
          id: groupActivityId5,
        },
      },
      group: {
        connect: {
          id: PARTICIPANT_GROUP_IDS[3],
        },
      },
    },
    update: {},
  })

  const groupActivityResults = {
    passed: true,
    points: 43,
    comment: 'This is an optional comment by the lecturer.',
    grading: groupActivityCompleted.stacks[0]!.elements.reduce<
      {
        instanceId: number
        correctness: string
        score: number
        feedback?: string
      }[]
    >((acc, element) => {
      if (element.elementType === Prisma.ElementType.CONTENT) return acc

      const maxPoints = (element.options.pointsMultiplier || 1) * 25 // default: 25 points
      const correctness = ['INCORRECT', 'PARTIAL', 'CORRECT'][
        Math.floor(Math.random() * 3)
      ] as 'INCORRECT' | 'PARTIAL' | 'CORRECT'

      return [
        ...acc,
        {
          instanceId: element.id,
          correctness: correctness,
          maxPoints: maxPoints,
          score:
            correctness === 'CORRECT'
              ? maxPoints
              : correctness === 'PARTIAL'
                ? Math.floor(Math.random() * maxPoints)
                : 0,
          ...(correctness === 'INCORRECT' && {
            feedback:
              'In case of an incorrect answer, this feedback is provided.',
          }),
          ...(correctness === 'PARTIAL' && {
            feedback:
              'In case of a partially correct answer, this feedback is provided.',
          }),
        },
      ]
    }, []),
  }

  const groupActivityResultsGraded = {
    passed: true,
    points: 105,
    comment: 'This is an optional comment by the lecturer.',
    grading: groupActivityGraded.stacks[0]!.elements.reduce<
      {
        instanceId: number
        correctness: string
        score: number
        feedback?: string
      }[]
    >((acc, element) => {
      if (element.elementType === Prisma.ElementType.CONTENT) return acc

      const maxPoints = (element.options.pointsMultiplier || 1) * 25 // default: 25 points
      const correctness = ['INCORRECT', 'PARTIAL', 'CORRECT'][
        Math.floor(Math.random() * 3)
      ] as 'INCORRECT' | 'PARTIAL' | 'CORRECT'

      return [
        ...acc,
        {
          instanceId: element.id,
          correctness: correctness,
          maxPoints: maxPoints,
          score:
            correctness === 'CORRECT'
              ? maxPoints
              : correctness === 'PARTIAL'
                ? Math.floor(Math.random() * maxPoints)
                : 0,
          ...(correctness === 'INCORRECT' && {
            feedback:
              'In case of an incorrect answer, this feedback is provided.',
          }),
          ...(correctness === 'PARTIAL' && {
            feedback:
              'In case of a partially correct answer, this feedback is provided.',
          }),
        },
      ]
    }, []),
  }

  // seed group activity instance with decisions and results for partially graded and ended group activity
  const groupActivityInstanceId5 = 5
  const groupActivityInstance5 = await prisma.groupActivityInstance.upsert({
    where: {
      id: groupActivityInstanceId5,
    },
    create: {
      decisions: groupActivityDecisions2,
      decisionsSubmittedAt: new Date('2020-06-15T11:00:00.000Z'),
      results: groupActivityResults,
      resultsComputedAt: new Date(),
      groupActivity: {
        connect: {
          id: groupActivityId5,
        },
      },
      group: {
        connect: {
          id: PARTICIPANT_GROUP_IDS[4],
        },
      },
    },
    update: {},
  })

  // seed group activity instance with decisions and results for graded and ended group activity
  const groupActivityInstanceId6 = 6
  const groupActivityInstance6 = await prisma.groupActivityInstance.upsert({
    where: {
      id: groupActivityInstanceId6,
    },
    create: {
      decisions: groupActivityDecisionsGraded,
      decisionsSubmittedAt: new Date('2020-06-15T11:00:00.000Z'),
      results: groupActivityResultsGraded,
      resultsComputedAt: new Date(),
      groupActivity: {
        connect: {
          id: groupActivityId6,
        },
      },
      group: {
        connect: {
          id: PARTICIPANT_GROUP_IDS[0],
        },
      },
    },
    update: {},
  })

  const groupActivityInstanceId7 = 7
  const groupActivityInstance7 = await prisma.groupActivityInstance.upsert({
    where: {
      id: groupActivityInstanceId7,
    },
    create: {
      decisions: groupActivityDecisionsGraded,
      decisionsSubmittedAt: new Date('2020-06-15T12:00:00.000Z'),
      results: groupActivityResultsGraded,
      resultsComputedAt: new Date(),
      groupActivity: {
        connect: {
          id: groupActivityId6,
        },
      },
      group: {
        connect: {
          id: PARTICIPANT_GROUP_IDS[1],
        },
      },
    },
    update: {},
  })

  const quizId = '4214338b-c5af-4ff7-84f9-ae5a139d6e5b'
  const practiceQuiz = await prismaClient.practiceQuiz.upsert({
    where: {
      id: quizId,
    },
    create: {
      id: quizId,
      name: 'Practice Quiz Demo',
      displayName: 'Practice Quiz Demo Student Title',
      description:
        'This is a **description** of the practice quiz, illustrating the use of flashcards, questions and content elements.',
      ownerId: USER_ID_TEST,
      courseId: COURSE_ID_TEST,
      status: Prisma.PublicationStatus.PUBLISHED,
      orderType: Prisma.ElementOrderType.SPACED_REPETITION,
      availableFrom: new Date('2020-01-01T11:00:00.000Z'),
      stacks: {
        create: [
          ...prepareStackVariety({
            migrationIdOffset: 600,
            flashcards: flashcards,
            questions: questionsTest,
            contentElements: contentElements,
            stackType: Prisma.ElementStackType.PRACTICE_QUIZ,
            elementInstanceType: Prisma.ElementInstanceType.PRACTICE_QUIZ,
            courseId: COURSE_ID_TEST,
            connectToCourse: true,
          }),
        ],
      },
    },
    update: {},
    include: {
      stacks: {
        include: {
          elements: true,
        },
      },
    },
  })

  const quizId2 = '58cfd921-2bc1-40a4-a186-846626eb0591'
  const practiceQuiz2 = await prismaClient.practiceQuiz.upsert({
    where: {
      id: quizId2,
    },
    create: {
      id: quizId2,
      name: 'Practice Quiz Draft',
      displayName: 'Practice Quiz Draft Student Title',
      description:
        'This is a **description** of the practice quiz, illustrating the use of flashcards, questions and content elements.',
      ownerId: USER_ID_TEST,
      courseId: COURSE_ID_TEST,
      status: Prisma.PublicationStatus.DRAFT,
      orderType: Prisma.ElementOrderType.SPACED_REPETITION,
      stacks: {
        create: [
          ...prepareStackVariety({
            migrationIdOffset: 700,
            flashcards: [flashcards[0]!],
            questions: [questionsTest[0]!],
            contentElements: [contentElements[0]!],
            stackType: Prisma.ElementStackType.PRACTICE_QUIZ,
            elementInstanceType: Prisma.ElementInstanceType.PRACTICE_QUIZ,
            courseId: COURSE_ID_TEST,
          }),
        ],
      },
    },
    update: {},
    include: {
      stacks: {
        include: {
          elements: true,
        },
      },
    },
  })

  const quizId3 = '56e51ab4-89e3-4d9d-ae04-dd9e8869fbd2'
  const practiceQuiz3 = await prismaClient.practiceQuiz.upsert({
    where: {
      id: quizId3,
    },
    create: {
      id: quizId3,
      name: 'Practice Quiz Future',
      displayName: 'Practice Quiz Future Student Title',
      description:
        'This is a **description** of the practice quiz, illustrating the use of flashcards, questions and content elements.',
      ownerId: USER_ID_TEST,
      courseId: COURSE_ID_TEST,
      status: Prisma.PublicationStatus.SCHEDULED,
      orderType: Prisma.ElementOrderType.SPACED_REPETITION,
      availableFrom: new Date('2030-01-01T11:00:00.000Z'),
      stacks: {
        create: [
          ...prepareStackVariety({
            migrationIdOffset: 800,
            flashcards: [flashcards[0]!],
            questions: [questionsTest[0]!],
            contentElements: [contentElements[0]!],
            stackType: Prisma.ElementStackType.PRACTICE_QUIZ,
            elementInstanceType: Prisma.ElementInstanceType.PRACTICE_QUIZ,
            courseId: COURSE_ID_TEST,
          }),
        ],
      },
    },
    update: {},
    include: {
      stacks: {
        include: {
          elements: true,
        },
      },
    },
  })

  const microlearningId1 = 'd2f7fcbc-a54c-4518-b094-91d8adbd803f'
  const microlearningPublished = await prismaClient.microLearning.upsert({
    where: {
      id: microlearningId1,
    },
    create: {
      id: microlearningId1,
      name: 'Test Microlearning',
      displayName: 'Test Microlearning',
      description: `
Diese Woche lernen wir...

Mehr bla bla...
`,
      owner: {
        connect: {
          id: USER_ID_TEST,
        },
      },
      course: {
        connect: {
          id: COURSE_ID_TEST,
        },
      },
      pointsMultiplier: 4,
      status: Prisma.PublicationStatus.PUBLISHED,
      scheduledEndAt: new Date('2030-01-01T11:00:00.000Z'),
      scheduledStartAt: new Date('2020-01-01T11:00:00.000Z'),
      stacks: {
        create: [
          ...prepareStackVariety({
            migrationIdOffset: 900,
            flashcards: flashcards,
            questions: questionsTest,
            contentElements: contentElements,
            stackType: Prisma.ElementStackType.MICROLEARNING,
            elementInstanceType: Prisma.ElementInstanceType.MICROLEARNING,
            courseId: COURSE_ID_TEST,
          }),
        ],
      },
    },
    update: {},
  })

  const microlearningId2 = '6a0b6674-5f9b-40fd-90a4-53d493c210ba'
  const microlearningFuture = await prismaClient.microLearning.upsert({
    where: {
      id: microlearningId2,
    },
    create: {
      id: microlearningId2,
      name: 'Test Microlearning Future',
      displayName: 'Test Microlearning Future',
      description: `
In ferner Zukunft lernen wir...

Mehr bla bla...
`,
      owner: {
        connect: {
          id: USER_ID_TEST,
        },
      },
      course: {
        connect: {
          id: COURSE_ID_TEST,
        },
      },
      pointsMultiplier: 1,
      status: Prisma.PublicationStatus.DRAFT,
      scheduledEndAt: new Date('2040-01-01T11:00:00.000Z'),
      scheduledStartAt: new Date('2030-01-01T11:00:00.000Z'),
      stacks: {
        create: [
          ...prepareStackVariety({
            migrationIdOffset: 1000,
            flashcards: flashcards,
            questions: questionsTest,
            contentElements: contentElements,
            stackType: Prisma.ElementStackType.MICROLEARNING,
            elementInstanceType: Prisma.ElementInstanceType.MICROLEARNING,
            courseId: COURSE_ID_TEST,
          }),
        ],
      },
    },
    update: {},
  })

  const microlearningId3 = '71702826-e693-451d-ad64-ed763d973fcd'
  const microlearningPast = await prismaClient.microLearning.upsert({
    where: {
      id: microlearningId3,
    },
    create: {
      id: microlearningId3,
      name: 'Test Microlearning Past',
      displayName: 'Test Microlearning Past',
      description: `Dieses Microlearning ist bereits vorbei...`,
      owner: {
        connect: {
          id: USER_ID_TEST,
        },
      },
      course: {
        connect: {
          id: COURSE_ID_TEST,
        },
      },
      pointsMultiplier: 1,
      status: Prisma.PublicationStatus.PUBLISHED,
      scheduledEndAt: new Date('2024-01-01T11:00:00.000Z'),
      scheduledStartAt: new Date('2020-01-01T11:00:00.000Z'),
      stacks: {
        create: [
          ...prepareStackVariety({
            migrationIdOffset: 1100,
            flashcards: flashcards,
            questions: questionsTest,
            contentElements: contentElements,
            stackType: Prisma.ElementStackType.MICROLEARNING,
            elementInstanceType: Prisma.ElementInstanceType.MICROLEARNING,
            courseId: COURSE_ID_TEST,
          }),
        ],
      },
    },
    update: {},
  })

  const microlearningId4 = '4a87f88d-5fb9-4eef-afce-9f5ed6edcc38'
  const microlearningPastNoFT = await prismaClient.microLearning.upsert({
    where: {
      id: microlearningId4,
    },
    create: {
      id: microlearningId4,
      name: 'Test Microlearning Past No FT',
      displayName: 'Test Microlearning Past No FT',
      description: `Dieses Microlearning ist bereits vorbei und enthält keine Freitext fragen (-> aktuelle Validierung)...`,
      owner: {
        connect: {
          id: USER_ID_TEST,
        },
      },
      course: {
        connect: {
          id: COURSE_ID_TEST,
        },
      },
      pointsMultiplier: 1,
      status: Prisma.PublicationStatus.PUBLISHED,
      scheduledEndAt: new Date('2024-01-01T11:00:00.000Z'),
      scheduledStartAt: new Date('2020-01-01T11:00:00.000Z'),
      stacks: {
        create: [
          ...prepareStackVariety({
            migrationIdOffset: 1200,
            flashcards: flashcards,
            questions: questionsTest.filter(
              (q) => q.type !== Prisma.ElementType.FREE_TEXT
            ),
            contentElements: contentElements,
            stackType: Prisma.ElementStackType.MICROLEARNING,
            elementInstanceType: Prisma.ElementInstanceType.MICROLEARNING,
            courseId: COURSE_ID_TEST,
          }),
        ],
      },
    },
    update: {},
  })

  const microlearningId5 = 'ec13a44b-22ce-4edc-b419-e2d7c07024fe'
  const microlearningDraft = await prismaClient.microLearning.upsert({
    where: {
      id: microlearningId5,
    },
    create: {
      id: microlearningId5,
      name: 'Test Microlearning Draft',
      displayName: 'Test Microlearning Draft',
      description: `
Once this microlearning is published, it will be immediately accessible
`,
      owner: {
        connect: {
          id: USER_ID_TEST,
        },
      },
      course: {
        connect: {
          id: COURSE_ID_TEST,
        },
      },
      pointsMultiplier: 1,
      status: Prisma.PublicationStatus.DRAFT,
      scheduledEndAt: new Date('2040-01-01T11:00:00.000Z'),
      scheduledStartAt: new Date('2020-01-01T11:00:00.000Z'),
      stacks: {
        create: [
          ...prepareStackVariety({
            migrationIdOffset: 1300,
            flashcards: flashcards,
            questions: questionsTest,
            contentElements: contentElements,
            stackType: Prisma.ElementStackType.MICROLEARNING,
            elementInstanceType: Prisma.ElementInstanceType.MICROLEARNING,
            courseId: COURSE_ID_TEST,
          }),
        ],
      },
    },
    update: {},
  })
}

const prismaClient = new Prisma.PrismaClient()

// @ts-ignore
await seedTest(prismaClient)
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prismaClient.$disconnect()
  })
