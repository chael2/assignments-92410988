import bcrypt from 'bcryptjs'
import { connectDB } from './mongodb'
import { User } from '@/models/User'

const SALT_ROUNDS = 10

export async function createUser(input: {
  name: string
  email: string
  password: string
}) {
  await connectDB()

  const existing = await User.findOne({ email: input.email })
  if (existing) {
    throw new Error('이미 가입된 이메일입니다.')
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
  })

  return { id: String(user._id), name: user.name, email: user.email }
}
