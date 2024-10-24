import { IntlErrorCode } from 'next-intl'

export function onError(error: any) {
  console.error(error)

  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    // Missing translations are expected and should only log an error
    console.error(error)
  }
}

export function getMessageFallback({
  namespace,
  key,
  error,
}: {
  namespace: string
  key: string
  error: any
}) {
  const path = [namespace, key].filter((part) => part != null).join('.')

  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    return `${path} is not yet translated`
  } else {
    return `Dear developer, please fix this message: ${path}. Error: ${error.message}`
  }
}
