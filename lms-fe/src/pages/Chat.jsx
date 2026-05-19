import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import {
  getTeachersForChat,
  getStudentsForChat,
  getMyConversations,
  getOrCreateConversation,
  getConversationMessages,
  sendChatMessage,
  markConversationAsRead,
} from '../service/chatService';
import { connectChatSocket, disconnectChatSocket, getChatSocket } from '../service/chatSocketService';
import { getUser } from '../service/userService';
import { useLocation } from 'react-router-dom';

const Chat = ({ mode = 'user' }) => {
  const location = useLocation();
  const isTeacherMode = mode === 'teacher';
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [startingConversationUserId, setStartingConversationUserId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(Number(localStorage.getItem('user_id') || 0));
  const activeConversationIdRef = useRef(activeConversationId);
  const loadConversationsRef = useRef(null);
  const handledContactUserIdRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollMessagesToBottom = (behavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  const resolveCurrentUserId = async () => {
    const localId = Number(localStorage.getItem('user_id') || 0);
    if (localId) {
      setCurrentUserId(localId);
      return localId;
    }

    try {
      const profileRes = await getUser();
      const payload = profileRes?.data ?? profileRes;
      const userId = Number(payload?.userId || payload?.UserID || payload?.id || 0);
      if (userId) {
        localStorage.setItem('user_id', String(userId));
        setCurrentUserId(userId);
      }
      return userId;
    } catch {
      return 0;
    }
  };

  const activeConversation = useMemo(
    () => conversations.find((item) => Number(item.conversationId) === Number(activeConversationId)) || null,
    [conversations, activeConversationId]
  );

  const title = mode === 'teacher' ? 'Chat với học viên' : 'Chat với giáo viên';

  const extractRows = (response) => {
    if (Array.isArray(response)) return response;

    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;

    return [];
  };

  const extractObject = (response) => {
    const payload = response?.data ?? response;
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      return payload;
    }
    return {};
  };

  const loadContacts = async () => {
    if (!isTeacherMode) {
      setContacts([]);
      return;
    }

    try {
      const response = await getStudentsForChat();
      const rows = extractRows(response);
      setContacts(rows);
    } catch (error) {
      setContacts([]);
      toast.error(error?.message || 'Không tải được danh sách người chat');
    }
  };

  const loadConversations = async ({ keepActive = true } = {}) => {
    try {
      const response = await getMyConversations();
      const rows = extractRows(response);
      setConversations(rows);

      const latestActiveConversationId = Number(activeConversationIdRef.current || 0);

      if (!keepActive) {
        setActiveConversationId(rows[0]?.conversationId || null);
        return;
      }

      if (!rows.some((item) => Number(item.conversationId) === latestActiveConversationId)) {
        setActiveConversationId(rows[0]?.conversationId || null);
      }
    } catch (error) {
      toast.error(error?.message || 'Không tải được danh sách hội thoại');
      setConversations([]);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getConversationMessages({ conversationId });
      const rows = extractRows(response);
      setMessages(rows);
      await markConversationAsRead({ conversationId });
      await loadConversations();
      const socket = getChatSocket();
      socket?.emit('chat:markRead', { conversationId });
    } catch (error) {
      toast.error(error?.message || 'Không tải được tin nhắn');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const startConversationWith = async (otherUserId) => {
    setStartingConversationUserId(otherUserId);
    try {
      const response = await getOrCreateConversation({ otherUserId });
      const payload = extractObject(response);
      const conversationId = payload?.data?.conversationId || payload?.conversationId;
      await loadConversations();
      if (conversationId) {
        setActiveConversationId(conversationId);
      }
      return true;
    } catch (error) {
      toast.error(error?.message || 'Không thể bắt đầu cuộc hội thoại');
      return false;
    } finally {
      setStartingConversationUserId(null);
    }
  };

  const handleSendMessage = async () => {
    const text = String(newMessageText || '').trim();
    if (!text || !activeConversationId) return;

    setSending(true);
    try {
      const socket = getChatSocket();
      if (socket && socket.connected) {
        socket.emit('chat:sendMessage', {
          conversationId: activeConversationId,
          messageText: text,
        });
      } else {
        await sendChatMessage({ conversationId: activeConversationId, messageText: text });
      }
      setNewMessageText('');
      await loadConversations();
    } catch (error) {
      toast.error(error?.message || 'Không gửi được tin nhắn');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    resolveCurrentUserId();
    loadContacts();
    loadConversations({ keepActive: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    const contactUserId = Number(location.state?.contactUserId || 0);
    if (!contactUserId || handledContactUserIdRef.current === contactUserId) return;
    if (!currentUserId) return;

    const existingConversation = conversations.find((conversation) => {
      return Number(conversation.otherUser?.userId) === contactUserId;
    });

    const openConversation = async () => {
      handledContactUserIdRef.current = contactUserId;

      if (existingConversation) {
        setActiveConversationId(existingConversation.conversationId);
        return;
      }

      const created = await startConversationWith(contactUserId);
      if (!created) {
        handledContactUserIdRef.current = null;
      }
    };

    openConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.contactUserId, conversations, currentUserId]);

  useEffect(() => {
    loadMessages(activeConversationId);
    const socket = getChatSocket();
    if (socket && activeConversationId) {
      socket.emit('chat:joinConversation', { conversationId: activeConversationId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) return;
    scrollMessagesToBottom('auto');
  }, [activeConversationId]);

  useEffect(() => {
    if (loading || !activeConversationId) return;
    scrollMessagesToBottom(messages.length > 1 ? 'smooth' : 'auto');
  }, [messages, loading, activeConversationId]);

  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  useEffect(() => {
    const socket = connectChatSocket();
    if (!socket) return undefined;

    const onNewMessage = (message) => {
      if (Number(message.conversationId) === Number(activeConversationIdRef.current)) {
        setMessages((prev) => {
          if (prev.some((item) => Number(item.messageId) === Number(message.messageId))) {
            return prev;
          }
          return [...prev, message];
        });
      }
      loadConversationsRef.current?.();
    };

    const onReadUpdated = () => {
      loadConversationsRef.current?.();
    };

    socket.on('chat:newMessage', onNewMessage);
    socket.on('chat:readUpdated', onReadUpdated);

    return () => {
      socket.off('chat:newMessage', onNewMessage);
      socket.off('chat:readUpdated', onReadUpdated);
      disconnectChatSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-4 space-y-5">
      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 min-h-0">
        <section className="xl:col-span-4 border-2 border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-4">
          {isTeacherMode && (
            <div>
              <h2 className="text-lg font-bold text-[#25B379] mb-2">Danh sách liên hệ</h2>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {contacts.map((contact) => (
                  <button
                    key={contact.userId}
                    type="button"
                    onClick={() => startConversationWith(contact.userId)}
                    className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                    disabled={startingConversationUserId === contact.userId}
                  >
                    <div className="text-left">
                      <p className="font-semibold text-gray-700">{contact.name || contact.userName}</p>
                      <p className="text-xs text-gray-500">@{contact.userName}</p>
                    </div>
                    {startingConversationUserId === contact.userId ? (
                      <span className="text-xs text-gray-500">Đang mở...</span>
                    ) : (
                      <FontAwesomeIcon icon="fa-solid fa-comment-dots" className="text-[#25B379]" />
                    )}
                  </button>
                ))}
                {contacts.length === 0 && (
                  <p className="text-sm text-gray-500">Không có dữ liệu liên hệ.</p>
                )}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-[#25B379] mb-2">Hội thoại của bạn</h2>
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.conversationId}
                  type="button"
                  onClick={() => setActiveConversationId(conversation.conversationId)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    Number(activeConversationId) === Number(conversation.conversationId)
                      ? 'border-[#25B379] bg-[#edf6ff]'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold text-gray-700">{conversation.otherUser?.name || conversation.otherUser?.userName || 'N/A'}</p>
                    {Number(conversation.unreadCount || 0) > 0 && (
                      <span className="inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conversation.lastMessage || 'Chưa có tin nhắn'}</p>
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="text-sm text-gray-500">Bạn chưa có hội thoại nào.</p>
              )}
            </div>
          </div>
        </section>

        <section className="xl:col-span-8 border-2 border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col min-h-[620px] h-[70vh] max-h-[760px] min-w-0">
          {activeConversation ? (
            <>
              <div className="border-b pb-3 mb-3">
                <h2 className="text-lg font-bold text-[#25B379]">
                  {activeConversation.otherUser?.name || activeConversation.otherUser?.userName}
                </h2>
                <p className="text-xs text-gray-500">@{activeConversation.otherUser?.userName}</p>
              </div>

              <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 scroll-smooth">
                {loading ? (
                  <p className="text-center text-gray-500 font-medium">Đang tải tin nhắn...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-500 font-medium">Chưa có tin nhắn nào.</p>
                ) : (
                  messages.map((message) => {
                    const mine = Number(message.senderId) === Number(currentUserId);
                    return (
                      <div key={message.messageId} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            mine ? 'bg-[#25B379] text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.messageText}</p>
                          <p className={`mt-1 text-[11px] ${mine ? 'text-white/80' : 'text-gray-500'}`}>
                            {message.sentAt ? new Date(message.sentAt).toLocaleString('vi-VN') : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t mt-3 flex gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(event) => setNewMessageText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#25B379]"
                />
                <button
                  type="button"
                  disabled={sending}
                  onClick={handleSendMessage}
                  className="rounded-lg bg-[#25B379] px-4 py-2 font-semibold text-white hover:bg-[#1e9a5a] disabled:opacity-60"
                >
                  Gửi
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 font-medium">
              Hãy chọn một hội thoại để bắt đầu chat.
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Chat;
