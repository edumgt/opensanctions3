import { NextRequest, NextResponse } from 'next/server';

// ✅ 모든 경로에 대해 아무런 인증 검사 없이 바로 통과
export const config = {
  matcher: ['/((?!readyz).*)'], // 모든 요청 허용
};

export default async function middleware(req: NextRequest) {
  // ✅ 그냥 요청 통과
  return NextResponse.next();
}
