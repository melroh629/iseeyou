// lib/services/__tests__/scheduleService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { deleteSchedule } from '../scheduleService';

// Supabase 클라이언트를 모킹합니다.
vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
    })),
  })),
}));

describe('scheduleService', () => {
  it('deleteSchedule은 id가 제공되지 않으면 에러를 던져야 한다', async () => {
    // id 없이 함수를 호출했을 때 프로미스가 거부(reject)되는지 확인합니다.
    await expect(deleteSchedule('')).rejects.toThrow('일정 ID가 필요합니다.');
    await expect(deleteSchedule(undefined as any)).rejects.toThrow(
      '일정 ID가 필요합니다.'
    );
  });
});
