import zxcvbn from 'zxcvbn';

const LABELS = ['Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E'];

interface Props {
  password: string;
}

export default function PasswordStrength({ password }: Props) {
  if (!password) return null;
  // zxcvbn returns score 0-4; map to 0-3 for display
  const result = zxcvbn(password);
  const level = Math.min(3, result.score === 4 ? 3 : result.score);
  return (
    <div className="mt-2" data-testid="password-strength">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i <= level ? COLORS[level] : 'rgba(255,255,255,0.06)' }}
          />
        ))}
      </div>
      <p className="text-[11px]" style={{ color: COLORS[level] }} data-testid="password-strength-label">
        {LABELS[level]}
        {result.feedback.warning ? ` — ${result.feedback.warning}` : ''}
      </p>
    </div>
  );
}
