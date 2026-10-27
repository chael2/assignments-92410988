'use server'
// 이 파일의 함수들은 Server Action입니다. 클라이언트 컴포넌트에서
// 그냥 함수처럼 import해서 호출하면, Next.js가 자동으로 서버에
// 요청을 보내고 결과를 받아옵니다 — 별도의 API 엔드포인트를
// 직접 만들지 않아도 됩니다. (6주차 MongoDB CRUD에서 본격적으로 사용)

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { likeProduct as likeProductInDb } from '@/lib/products'
import { createNotice, deleteNotice, getNotice } from '@/lib/notices'
import { createUser } from '@/lib/users'
import { signIn, signOut, auth } from '@/auth'

export async function likeProductAction(id: string) {
  const newLikes = await likeProductInDb(id)
  // 이 경로를 다시 그리도록 Next.js에 알려줍니다 — 다른 탭/새로고침에서도
  // 최신 좋아요 수가 보이게 합니다.
  revalidatePath(`/products/${id}`)
  return newLikes
}

// 9주차부터 이 액션은 로그인 여부를 직접 확인합니다. middleware.ts가
// /notices/new 페이지 접근 자체를 막아주지만, Server Action은 middleware의
// matcher와 무관하게 어디서든(다른 페이지, 심지어 조작된 요청에서도) 호출될
// 수 있습니다. 그래서 "이중 방어"로 액션 내부에서도 반드시 다시 확인합니다.
export async function createNoticeAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!title || !content) {
    // 실습 단계의 아주 단순한 검증입니다.
    // 실제 서비스라면 에러 상태를 돌려주고 폼에 메시지를 보여줘야 합니다.
    throw new Error('제목과 내용을 모두 입력해주세요.')
  }

  // author는 더 이상 폼에서 입력받지 않습니다 — 로그인한 사용자의 세션에서
  // 서버가 직접 가져옵니다. 그렇지 않으면 누구든 폼 값을 조작해서
  // 다른 사람 이름으로 글을 쓸 수 있습니다.
  const notice = await createNotice({
    title,
    content,
    authorId: session.user.id,
    authorName: session.user.name ?? '이름 없음',
  })
  revalidatePath('/notices')
  redirect(`/notices/${notice.id}`)
}

// 삭제 권한 검사가 이번 주의 핵심입니다. 화면에는 작성자 본인 또는
// admin에게만 삭제 버튼이 보이지만(app/notices/[id]/page.tsx), 그건 어디까지나
// 사용자 경험일 뿐입니다. 버튼이 안 보인다고 해서 요청 자체를 막을 수는
// 없습니다 — 개발자 도구나 직접 조작한 요청으로 얼마든지 이 함수를 호출할
// 수 있으므로, 진짜 방어는 반드시 여기, 서버 코드 안에 있어야 합니다.
export async function deleteNoticeAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) {
    throw new Error('잘못된 요청입니다.')
  }

  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const notice = await getNotice(id)
  if (!notice) {
    throw new Error('존재하지 않는 게시글입니다.')
  }

  const isOwner = notice.authorId === session.user.id
  const isAdmin = session.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    throw new Error('삭제 권한이 없습니다.')
  }

  await deleteNotice(id)
  revalidatePath('/notices')
  redirect('/notices')
}

// 회원가입: 비밀번호를 해싱해 User 컬렉션에 저장한 뒤, 곧바로 로그인까지
// 이어서 처리합니다. signIn()이 성공하면 내부적으로 리다이렉트를 던지므로
// registerAction은 반환값을 따로 처리하지 않습니다.
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
