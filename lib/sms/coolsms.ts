import crypto from 'crypto'

// Cool SMS v4 SDK 사용 (HMAC 인증)
const messageService = {
  sendOne: async (params: any) => {
    const apiKey = process.env.COOLSMS_API_KEY!
    const apiSecret = process.env.COOLSMS_API_SECRET!

    const date = new Date().toISOString()
    const salt = crypto.randomBytes(32).toString('hex')

    // HMAC 서명 생성
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(date + salt)
      .digest('hex')

    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
      },
      body: JSON.stringify({
        message: {
          to: params.to,
          from: params.from,
          text: params.text,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Cool SMS API 에러:', error)
      throw new Error(`SMS 발송 실패: ${error}`)
    }

    return await response.json()
  }
}

/**
 * SMS 발송
 */
export async function sendSMS(to: string, text: string) {
  const senderPhone = process.env.COOLSMS_SENDER_PHONE

  if (!senderPhone) {
    throw new Error('발신번호(COOLSMS_SENDER_PHONE)가 설정되지 않았습니다.')
  }

  try {
    const response = await messageService.sendOne({
      to,
      from: senderPhone,
      text,
    })

    console.log('✅ SMS 발송 성공:', { to, from: senderPhone })
    return response
  } catch (error: any) {
    console.error('❌ SMS 발송 실패:', error)
    throw new Error(error.message || 'SMS 발송에 실패했습니다.')
  }
}

/**
 * OTP SMS 발송
 */
export async function sendOTPSMS(phoneNumber: string, otp: string) {
  const message = `[ISeeYou] 인증번호는 [${otp}]입니다. 3분 이내에 입력해주세요.`

  return await sendSMS(phoneNumber, message)
}

/**
 * 6자리 랜덤 OTP 생성
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 전화번호 포맷 정리 (01012345678)
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

/**
 * 전화번호 포맷팅 (010-1234-5678)
 */
export function formatPhoneNumber(phone: string): string {
  const clean = cleanPhoneNumber(phone)
  if (clean.length === 11) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7)}`
  }
  return phone
}
