import { preExecRule } from '@graphql-authz/core'
import { UserRole } from '@klicker-uzh/prisma'

const IsAuthenticated = preExecRule()((ctx: any) => {
  return !!ctx.user
})

const IsParticipant = preExecRule()((ctx: any) => {
  return ctx.user && ctx.user.role === UserRole.PARTICIPANT
})

const IsUser = preExecRule()((ctx: any) => {
  return ctx.user && ctx.user.role === UserRole.USER
})

const IsAdmin = preExecRule()((ctx: any) => {
  return ctx.user && ctx.user.role === UserRole.ADMIN
})

export const Rules = {
  IsAuthenticated,
}

export const AuthSchema = {
  Mutation: {
    '*': { __authz: { rules: ['Reject'] } },
    login: { __authz: { rules: ['Allow'] } },
    registerParticipantFromLTI: { __authz: { rules: ['Allow'] } },
  },
  Query: {
    '*': { __authz: { rules: ['Reject'] } },
    learningElement: { __authz: { rules: ['Allow'] } },
  },
}