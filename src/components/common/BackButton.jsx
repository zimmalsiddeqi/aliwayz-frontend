import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ to, className = '' }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`p-2 rounded-xl transition-colors hover:bg-[var(--glass-bg-strong)] ${className}`}
      style={{ color: 'var(--color-text-secondary)' }}
      aria-label="Go back"
    >
      <ArrowLeft size={20} />
    </button>
  );
}