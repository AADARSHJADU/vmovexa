function timeMinutes(value) {
  const match = typeof value === 'string' && value.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

export function slotOverlapsHour(startTime, endTime, hour) {
  const start = timeMinutes(startTime);
  const end = timeMinutes(endTime);
  if (start === null || end === null || start === end) return false;
  const hourStart = hour * 60;
  const hourEnd = hourStart + 60;
  return end > start
    ? start < hourEnd && end > hourStart
    : start < hourEnd || end > hourStart;
}
