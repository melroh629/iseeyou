/**
 * 자동 토큰 갱신 기능이 포함된 fetch wrapper
 * 401 에러 발생 시 자동으로 refresh token으로 access token을 갱신하고 재시도
 */

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })

    if (response.ok) {
      console.log('[Token Refresh] Access token이 갱신되었습니다.')
      return true
    } else {
      console.error('[Token Refresh] 실패:', response.status)
      return false
    }
  } catch (error) {
    console.error('[Token Refresh] 에러:', error)
    return false
  }
}

/**
 * 자동 토큰 갱신 기능이 있는 fetch
 * 401 에러 발생 시 자동으로 토큰을 갱신하고 요청을 재시도합니다.
 */
export async function fetchWithRefresh(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  // credentials를 항상 포함하도록 설정
  const options: RequestInit = {
    ...init,
    credentials: 'include',
  }

  // 첫 번째 요청 시도
  let response = await fetch(input, options)

  // 401 에러이고 refresh 중이 아니라면
  if (response.status === 401) {
    // 이미 refresh 중이면 기다림
    if (isRefreshing && refreshPromise) {
      const refreshSuccess = await refreshPromise
      if (refreshSuccess) {
        // 갱신 성공했으면 재시도
        response = await fetch(input, options)
      }
      return response
    }

    // refresh 시작
    isRefreshing = true
    refreshPromise = refreshAccessToken()

    const refreshSuccess = await refreshPromise

    // refresh 완료
    isRefreshing = false
    refreshPromise = null

    if (refreshSuccess) {
      // 토큰 갱신 성공 시 원래 요청 재시도
      response = await fetch(input, options)
    } else {
      // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/student')) {
        window.location.href = '/'
      } else if (currentPath.startsWith('/admin')) {
        // 관리자 페이지에서 401 발생 시 메인 도메인으로 이동
        if (window.location.hostname.startsWith('admin.')) {
          const mainDomain = window.location.hostname.replace('admin.', '')
          window.location.href = `${window.location.protocol}//${mainDomain}/`
        } else {
          window.location.href = '/'
        }
      }
    }
  }

  return response
}
