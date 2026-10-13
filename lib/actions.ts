'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { likeProduct as likeProductInDb } from '@/lib/products'
import { createNotice } from '@/lib/notices'
import { createUser } from './users'
import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'

export async function likeProductAction(id: string) {
  const newLikes = await likeProductInDb(id)
  revalidatePath(`/products/${id}`)
  return newLikes
}

export async function createNoticeAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const author = String(formData.get('author') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!title || !author || !content) {
    throw new Error('제목, 작성자, 내용을 모두 입력해주세요.')
  }

  const notice = await createNotice({ title, author, content })
  revalidatePath('/notices')

  const targetId = (notice as any)._id?.toString() ?? notice.id
  redirect(`/notices/${targetId}`)
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!name || !email || !password) {
    throw new Error('이름, 이메일, 비밀번호를 모두 입력해주세요.')
  }
  if (password.length < 8) {
    throw new Error('비밀번호는 8자 이상이어야 합니다.')
  }

  await createUser({ name, email, password })
  await signIn('credentials', { email, password, redirectTo: '/' })
}

export async function loginAction(formData: FormData) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      redirect('/login?error=1')
    }
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' })
}
