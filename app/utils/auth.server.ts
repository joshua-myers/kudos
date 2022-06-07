import { json } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma.server'
import type { LoginForm, RegisterForm } from './types.server'
import { createUser } from './users.server'

export const register = async (user: RegisterForm) => {
  const exists = await prisma.user.count({ where: { email: user.email } })
  if (exists) {
    return json({ error: `User already exists with that email` }, { status: 400 })
  }

  const newUser = await createUser(user);
  if (!newUser) {
    return json(
      {
        error: `Something went wrong trying to create a new user.`,
        fields: { email: user.email, password: user.password },
      },
      { status: 400 },
    )
  }
}

export async function login({ email, password }: LoginForm) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !(await bcrypt.compare(password, user.password)))
    return json({ error: `Incorrect login` }, { status: 400 })

  return { id: user.id, email }
}