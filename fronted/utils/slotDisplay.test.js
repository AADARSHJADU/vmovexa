import { describe, expect, it } from 'vitest';
import { slotOverlapsHour } from './slotDisplay';

describe('slot timetable uses recorded timings', () => {
  it.each([[null, '12:00'], ['08:00', null], ['', ''], ['invalid', '12:00'], ['25:00', '12:00']])(
    'does not invent hours for missing or invalid times: %s - %s', (start, end) => {
      expect(slotOverlapsHour(start, end, 9)).toBe(false);
    },
  );

  it('includes partially occupied hours and excludes the exact end boundary', () => {
    expect(slotOverlapsHour('07:30:00', '12:00:00', 7)).toBe(true);
    expect(slotOverlapsHour('07:30:00', '12:00:00', 11)).toBe(true);
    expect(slotOverlapsHour('07:30:00', '12:00:00', 12)).toBe(false);
    expect(slotOverlapsHour('07:30:00', '12:15:00', 12)).toBe(true);
  });

  it('shows overnight shifts on both sides of midnight', () => {
    expect(slotOverlapsHour('22:00', '02:00', 23)).toBe(true);
    expect(slotOverlapsHour('22:00', '02:00', 0)).toBe(true);
    expect(slotOverlapsHour('22:00', '02:00', 2)).toBe(false);
    expect(slotOverlapsHour('22:00', '02:00', 12)).toBe(false);
  });

  it('does not assume a full-day schedule from identical times', () => {
    expect(slotOverlapsHour('08:00', '08:00', 8)).toBe(false);
  });
});
