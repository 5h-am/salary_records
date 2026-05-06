export function formatNumber(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-IN').format(n);
}

export function formatScore(score) {
  if (score == null) return '—';
  return score.toFixed(2);
}

export function scoreLabel(score) {
  if (score == null)  return 'Insufficient peer data';
  if (score <= 0.35)  return 'Below market';
  if (score <= 0.50)  return 'Slightly below market';
  if (score <= 0.65)  return 'At market';
  if (score <= 0.80)  return 'Above market';
  return 'Well above market';
}

export function companyInitial(name) {
  return (name || '?')[0].toUpperCase();
}

// Stable color from company name for avatar background
const AVATAR_COLORS = ['#1d4ed8','#7c3aed','#0f766e','#b45309','#be123c','#15803d'];
export function avatarColor(name) {
  let h = 0;
  for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
