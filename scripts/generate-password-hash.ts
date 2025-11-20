/**
 * 비밀번호 해시 생성 스크립트
 *
 * 사용법:
 * npx ts-node scripts/generate-password-hash.ts <password>
 *
 * 예시:
 * npx ts-node scripts/generate-password-hash.ts testpassword123
 */

const bcrypt = require('bcryptjs')

const password = process.argv[2]

if (!password) {
  console.error('❌ 비밀번호를 입력해주세요')
  console.log('\n사용법:')
  console.log('  npx ts-node scripts/generate-password-hash.ts <password>')
  console.log('\n예시:')
  console.log('  npx ts-node scripts/generate-password-hash.ts testpassword123')
  process.exit(1)
}

async function generateHash() {
  const hash = await bcrypt.hash(password, 10)
  console.log('\n✅ 비밀번호 해시 생성 완료!')
  console.log('\n원본 비밀번호:', password)
  console.log('해시값:', hash)
  console.log('\n이 해시값을 SQL 쿼리의 password_hash에 넣으세요:\n')
  console.log(`  password_hash: '${hash}'`)
  console.log('')
}

generateHash()
