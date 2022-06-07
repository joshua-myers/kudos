import { User } from "@prisma/client"

export type RegisterForm = Pick<User, 'email' | 'password'> & Pick<User['profile'], 'firstName' | 'lastName'>