import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // 이 콜백은 요청마다 실행되어 "이 사용자가 이 경로에 들어가도 되는가"를
    // true/false로만 답합니다. false를 반환하면 Auth.js가 자동으로
    // pages.signIn(/login)으로 리다이렉트합니다.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtectedRoute = nextUrl.pathname.startsWith('/notices/new')
      if (isProtectedRoute) return isLoggedIn
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
