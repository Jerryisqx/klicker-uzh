import { useQuery } from '@apollo/client'
import {
  GetSingleCourseDocument,
  SessionStatus,
} from '@klicker-uzh/graphql/dist/ops'
import { UserNotification } from '@uzh-bf/design-system'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import SessionLists from '../../components/sessions/SessionLists'
import Layout from '../../components/Layout'

function Course() {
  const router = useRouter()

  const { loading, error, data } = useQuery(GetSingleCourseDocument, {
    variables: { courseId: router.query.id as string },
    skip: !router.query.id,
  })

  useEffect(() => {
    if (data && !data.course) {
      router.push('/404')
    }
  }, [data, router])

  if (loading) {
    return <Layout title="Kursübersicht">Loading...</Layout>
  }
  if (!data?.course || error) {
    return (
      <Layout title="Kursübersicht">
        <UserNotification
          notificationType="error"
          className={{ root: 'text-base' }}
          message="Es ist ein Fehler aufgetreten beim Laden Ihrer Kurse. Bitte versuchen
        Sie es später erneut."
        />
      </Layout>
    )
  }

  const { course } = data

  const runningSessions = course.sessions.filter(
    (session) => session.status === SessionStatus.Running
  )
  const plannedSessions = course.sessions.filter(
    (session) =>
      session.status === SessionStatus.Prepared ||
      session.status === SessionStatus.Scheduled
  )

  return (
    <Layout title={course.name}>
      <SessionLists
        runningSessions={runningSessions}
        plannedSessions={plannedSessions}
      />

      <div className="mt-4 text-base italic">
        Abgeschlossene Sessionen können auf der entsprechenden Seite in der
        Management-App mit Resultaten betrachtet werden.
      </div>
    </Layout>
  )
}

export default Course