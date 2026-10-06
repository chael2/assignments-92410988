'use server'
// 이 파일의 함수들은 Server Action입니다. 클라이언트 컴포넌트에서
// 그냥 함수처럼 import해서 호출하면, Next.js가 자동으로 서버에
// 요청을 보내고 결과를 받아옵니다 — 별도의 API 엔드포인트를
// 직접 만들지 않아도 됩니다. (6주차 MongoDB CRUD에서 본격적으로 사용)

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { likeProduct as likeProductInDb } from '@/lib/products'
import { createNotice } from '@/lib/notices'

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
