import { useQuery } from '@apollo/client'
import { faList, faPeopleGroup } from '@fortawesome/free-solid-svg-icons'
import { GetControlCoursesDocument } from '@klicker-uzh/graphql/dist/ops'
import Loader from '@klicker-uzh/shared-components/src/Loader'
import { H4, UserNotification } from '@uzh-bf/design-system'
import { GetStaticPropsContext } from 'next'
import { useTranslations } from 'next-intl'
import Layout from '../components/Layout'
import ListButton from '../components/common/ListButton'

function Index() {
  const t = useTranslations()
  const {
    loading: loadingCourses,
    error: errorCourses,
    data: dataCourses,
  } = useQuery(GetControlCoursesDocument)

  if (loadingCourses) {
    return (
      <Layout title={t('control.home.courseSelection')}>
        <Loader />
      </Layout>
    )
  }

  if ((!loadingCourses && !dataCourses) || errorCourses) {
    return (
      <Layout title={t('control.home.courseSelection')}>
        <UserNotification
          type="error"
          className={{ root: 'text-base' }}
          message="Es ist ein Fehler aufgetreten beim Laden Ihrer Kurse. Bitte versuchen
        Sie es später erneut."
        />
      </Layout>
    )
  }

  return (
    <Layout title={t('control.home.courseSelection')}>
      <div className="flex w-full flex-col gap-4">
        {dataCourses?.controlCourses && (
          <div>
            <H4>{t('control.home.selectCourse')}</H4>
            <div className="flex flex-col gap-2">
              {[...dataCourses?.controlCourses]
                .sort((a, b) => (a.isArchived ? 1 : -1))
                .map((course) => (
                  <ListButton
                    key={course.id}
                    link={`/course/${course.id}`}
                    icon={faPeopleGroup}
                    label={
                      !course.isArchived
                        ? course.name
                        : t
                            .rich('control.home.archivedCourse', {
                              courseName: course.name,
                            })
                            .toString()
                    }
                    data={{ cy: `course-${course.name}` }}
                  />
                ))}
            </div>
          </div>
        )}

        <div>
          <H4>{t('control.home.sessionsNoCourse')}</H4>
          <div className="flex flex-col gap-2">
            <ListButton
              link="/course/unassigned"
              icon={faList}
              label={t('control.home.listSessionsNoCourse')}
              data={{ cy: 'unassigned-sessions' }}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`@klicker-uzh/i18n/messages/${locale}`)).default,
    },
  }
}

export default Index
