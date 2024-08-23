import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { LoginParticipantWithLtiDocument } from '@klicker-uzh/graphql/dist/ops'
import bodyParser from 'body-parser'
import JWT from 'jsonwebtoken'
import { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'

export default async function getParticipantToken({
  apolloClient,
  ctx,
}: {
  apolloClient: ApolloClient<NormalizedCacheObject>
  ctx: GetServerSidePropsContext
}) {
  const { req, res, query } = ctx

  const cookies = nookies.get(ctx)

  // if the user already has a participant token, skip registration
  // fetch the relevant data directly
  let participantToken: string | undefined | null = cookies['participant_token']

  if (participantToken) {
    return {
      participantToken,
      cookiesAvailable: true,
      jwt: query.jwt,
    }
  }

  try {
    let result

    // LTI 1.3 authentication flow
    if (cookies['lti-token'] || query.jwt) {
      const token = cookies['lti-token'] ?? query.jwt

      try {
        const signedLtiData = JWT.verify(
          token,
          process.env.APP_SECRET as string
        ) as { sub: string; email: string; scope: string }

        console.log('LTI 1.3', signedLtiData)

        if (signedLtiData.scope === 'LTI1.3') {
          result = await apolloClient.mutate({
            mutation: LoginParticipantWithLtiDocument,
            variables: {
              signedLtiData: token,
            },
          })
        }
      } catch (e) {}
    }
    // LTI 1.1 authentication flow
    else if (req.method === 'POST') {
      // extract the body from the LTI request
      // if there is a body, request a participant token
      // TODO: verify that there is an LTI body and that it is valid
      const { request }: any = await new Promise((resolve) => {
        bodyParser.urlencoded({ extended: true })(req, res, () => {
          bodyParser.json()(req, res, () => {
            resolve({ request: req })
          })
        })
      })

      console.log('LTI 1.1', request?.body)

      if (request?.body?.lis_person_sourcedid) {
        // send along a JWT to ensure only the next server is allowed to register participants from LTI
        const signedLtiData = JWT.sign(
          {
            sub: request?.body?.lis_person_sourcedid,
            email: request?.body?.lis_person_contact_email_primary,
            scope: 'LTI1.1',
          },
          process.env.APP_SECRET as string,
          {
            algorithm: 'HS256',
            expiresIn: '5m',
          }
        )

        result = await apolloClient.mutate({
          mutation: LoginParticipantWithLtiDocument,
          variables: {
            signedLtiData,
          },
        })
      }
    }

    participantToken = result?.data?.loginParticipantWithLti?.participantToken

    if (participantToken) {
      nookies.set(ctx, 'participant_token', participantToken, {
        domain: process.env.COOKIE_DOMAIN,
        path: '/',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 13,
        secure:
          process.env.NODE_ENV === 'production' &&
          process.env.COOKIE_DOMAIN !== '127.0.0.1',
        sameSite:
          process.env.NODE_ENV === 'development' ||
          process.env.COOKIE_DOMAIN === '127.0.0.1'
            ? 'lax'
            : 'none',
      })
    }

    return {
      participantToken,
      participant: result?.data?.loginParticipantWithLti,
      cookiesAvailable: null,
      jwt: query.jwt,
    }
  } catch (e) {
    console.error(e)
  }

  return {
    participantToken,
    cookiesAvailable: null,
  }
}