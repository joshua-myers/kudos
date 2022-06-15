import { prisma } from './prisma.server'
import { KudoStyle, Prisma } from '@prisma/client'

export const createKudo = async (message: string, userId: string, recipientId: string, style: KudoStyle) => {
  await prisma.kudo.create({
    data: {
      message,
      style,
      author: {
        connect: {
          id: userId,
        },
      },
      recipient: {
        connect: {
          id: recipientId,
        },
      },
    },
  })
}

export const getFilteredKudos = async (
  userId: string,
  sortFilter: Prisma.KudoOrderByWithRelationInput,
  whereFilter: Prisma.KudoWhereInput,
) => {
  return await prisma.kudo.findMany({
    select: {
      id: true,
      style: true,
      message: true,
      author: {
        select: {
          profile: true,
        },
      },
    },
    orderBy: {
      ...sortFilter,
    },
    where: {
      recipientId: userId,
      ...whereFilter,
    },
  })
}