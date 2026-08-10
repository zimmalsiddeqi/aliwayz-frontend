import { MapPin, Calendar } from 'lucide-react';
import Avatar from '@components/ui/Avatar';
import BadgeUI from '@components/ui/Badge';
import { cn } from '@lib/utils';
import { formatMemberSince } from '@utils/formatters';
import { getBadgeDisplay } from '@utils/helpers';

export default function ProfileHeader({ profile, isOwn = false }) {
  const badges = (profile?.user_badges || []).filter((b) => b.is_active);

  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <Avatar
        src={profile?.avatar_url}
        name={profile?.full_name || profile?.username}
        size="2xl"
      />

      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {profile?.full_name || profile?.username}
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>@{profile?.username}</p>
      </div>

      {profile?.bio && (
        <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>{profile.bio}</p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {profile?.location_city && (
          <span className="flex items-center gap-1"><MapPin size={11} />{profile.location_city}</span>
        )}
        <span className="flex items-center gap-1"><Calendar size={11} />{formatMemberSince(profile?.created_at)}</span>
        {profile?.email_verified && <BadgeUI variant="success" size="xs">✉ Verified</BadgeUI>}
        {profile?.phone_verified && <BadgeUI variant="info" size="xs">📱 Verified</BadgeUI>}
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {badges.map((ub) => {
            const d = getBadgeDisplay(ub.badges?.code);
            return (
              <span key={ub.badges?.code} className={cn('badge text-[11px]', d.color)}>
                {d.emoji} {ub.badges?.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}