import { io } from 'socket.io-client';

let socketInstance = null;

const resolveSocketBaseUrl = () => {
  const apiUrl = String(import.meta.env.VITE_BACKEND_URL || '').trim();
  if (!apiUrl) return 'http://localhost:3000';
  return apiUrl.replace(/\/api\/?$/i, '');
};

const connectChatSocket = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  socketInstance = io(resolveSocketBaseUrl(), {
    transports: ['websocket'],
    auth: { token },
  });

  return socketInstance;
};

const getChatSocket = () => socketInstance;

const disconnectChatSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export {
  connectChatSocket,
  getChatSocket,
  disconnectChatSocket,
};
