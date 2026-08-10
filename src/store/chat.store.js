import { create } from 'zustand';
import { generateTempId } from '@utils/helpers';

const useChatStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────
  conversations:      [],
  activeConversation: null,
  messages:           {},     // { [conversationId]: Message[] }
  typingUsers:        {},     // { [conversationId]: Set<userId> }
  onlineUsers:        new Set(),
  totalUnread:        0,

  // ── Actions ────────────────────────────────────────────────

  /**
   * Set all conversations (from API load)
   */
  setConversations: (conversations) => {
    const totalUnread = conversations.reduce((sum, conv) => {
      return sum + (conv.unread_count || 0);
    }, 0);
    set({ conversations, totalUnread });
  },

  /**
   * Set active conversation
   */
  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation });
  },

  /**
   * Set messages for a conversation
   */
  setMessages: (conversationId, messages) => {
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    }));
  },

  /**
   * Add new message (from Socket.IO or API)
   * Handles optimistic updates
   */
  addMessage: (conversationId, message) => {
    set((state) => {
      const existing = state.messages[conversationId] || [];

      // Replace temp message if it exists
      if (message.tempId) {
        const updated = existing.map((m) =>
          m.id === message.tempId ? { ...message, tempId: undefined } : m
        );
        return { messages: { ...state.messages, [conversationId]: updated } };
      }

      // Avoid duplicates
      const isDuplicate = existing.some((m) => m.id === message.id);
      if (isDuplicate) return state;

      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existing, message],
        },
      };
    });

    // Update conversation preview
    get().updateConversationPreview(conversationId, message);
  },

  /**
   * Add optimistic message (before server confirms)
   */
  addOptimisticMessage: (conversationId, content, senderId, senderData) => {
    const tempId = generateTempId();
    const tempMessage = {
      id:              tempId,
      conversation_id: conversationId,
      sender_id:       senderId,
      content,
      content_type:    'text',
      is_read:         false,
      created_at:      new Date().toISOString(),
      sender:          senderData,
      isPending:       true,
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), tempMessage],
      },
    }));

    return tempId;
  },

  /**
   * Mark messages as read in a conversation
   */
  markConversationRead: (conversationId, userId) => {
    set((state) => {
      // Update messages
      const messages = (state.messages[conversationId] || []).map((m) =>
        m.sender_id !== userId ? { ...m, is_read: true } : m
      );

      // Update conversation unread count
      const conversations = state.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        return { ...c, unread_count: 0, buyer_unread_count: 0, seller_unread_count: 0 };
      });

      // Recalculate total unread
      const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

      return { messages: { ...state.messages, [conversationId]: messages }, conversations, totalUnread };
    });
  },

  /**
   * Update conversation preview after new message
   */
  updateConversationPreview: (conversationId, message) => {
    set((state) => {
      const conversations = state.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          last_message_at:      message.created_at,
          last_message_preview: message.content?.substring(0, 100) || '',
        };
      });

      // Sort by last message
      conversations.sort(
        (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
      );

      return { conversations };
    });
  },

  /**
   * Set typing state for a user in a conversation
   */
  setTyping: (conversationId, userId, isTyping) => {
    set((state) => {
      const typingSet = new Set(state.typingUsers[conversationId] || []);
      if (isTyping) {
        typingSet.add(userId);
      } else {
        typingSet.delete(userId);
      }
      return {
        typingUsers: { ...state.typingUsers, [conversationId]: typingSet },
      };
    });
  },

  /**
   * Set user online status
   */
  setUserOnline: (userId) => {
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
    }));
  },

  setUserOffline: (userId) => {
    set((state) => {
      const updated = new Set(state.onlineUsers);
      updated.delete(userId);
      return { onlineUsers: updated };
    });
  },

  isUserOnline: (userId) => {
    return get().onlineUsers.has(userId);
  },

  /**
   * Get typing users for a conversation (excluding self)
   */
  getTypingUsers: (conversationId, selfId) => {
    const typingSet = get().typingUsers[conversationId] || new Set();
    return [...typingSet].filter((id) => id !== selfId);
  },

  /**
   * Reset chat state on logout
   */
  reset: () => {
    set({
      conversations:      [],
      activeConversation: null,
      messages:           {},
      typingUsers:        {},
      onlineUsers:        new Set(),
      totalUnread:        0,
    });
  },
}));

export default useChatStore;