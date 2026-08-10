import ConversationCard from '@components/cards/ConversationCard';
import { ConversationSkeleton } from '@components/ui/Skeleton';
import EmptyState from '@components/common/EmptyState';

export default function ConversationList({ conversations, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <EmptyState
        icon="💬"
        title="No conversations yet"
        description="Start chatting by messaging a seller!"
        actionLabel="Browse Marketplace"
        actionTo="/marketplace"
      />
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv, i) => (
        <ConversationCard key={conv.id} conversation={conv} index={i} />
      ))}
    </div>
  );
}