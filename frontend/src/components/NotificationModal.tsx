import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCSRFToken } from '../utils/cookies';
import { Notification } from './interface_type';


interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  // setUnreadCount?: (n: number) => void;
  notifications: Notification[];
  // setNotifications: (n: Notification[]) => void;
  onRead: (noti: Notification) => void;
}

const typeToPath = (noti: Notification) => {
  switch (noti.type) {
    case 'booking':
      return '/bookings';
    case 'contract':
      return '/contracts';
    case 'bill':
      return '/bills';
    case 'chat':
      return '/chat';
    default:
      return '/';
  }
};

const csrftoken = getCSRFToken();
const NotificationModal: React.FC<NotificationModalProps> = ({ open, onClose, notifications, onRead }) => {
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (open) {
  //     setLoading(true);
  //     axios.get(`${process.env.REACT_APP_API_URL}/api/notifications/`, { withCredentials: true, headers: { 'X-CSRFToken': csrftoken || '' } })
  //       .then(res => {setNotifications(res.data);
  //         if (typeof setUnreadCount === 'function') {
  //         const unread = res.data.filter((n: Notification) => !n.is_read).length;
  //         setUnreadCount(unread);
  //       }
  //       })
  //       .finally(() => setLoading(false));
  //   }
  // }, [open]);

  const handleClick = async (noti: Notification) => {
    // Update is_read
    if (!noti.is_read) {
      await onRead(noti);
    }
    onClose();
    navigate(typeToPath(noti));
  };

  if (!open) return null;

  return (
    <div className="absolute top-[4rem] right-[1rem]">
      <div className="bg-white rounded-xl shadow-2xl w-[420px] max-h-[80vh] overflow-auto p-0 relative animate-fade-in">
        <button className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 transition-colors" onClick={onClose}>×</button>
        <h2 className="text-xl font-bold mb-2 pt-5 pb-2 px-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white rounded-t-xl">Thông báo</h2>
        <div className="px-6 py-4">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Đang tải...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Không có thông báo nào.</div>
          ) : (
            <ul className="space-y-2">
              {notifications.map(noti => (
                <li
                  key={noti.id}
                  className={`p-3 rounded-lg cursor-pointer border border-transparent hover:border-green-400 transition-all group ${noti.is_read ? 'bg-gray-100 text-gray-500' : 'bg-green-50 font-semibold text-green-900 shadow-sm'}`}
                  onClick={() => handleClick(noti)}
                >
                  <div className="flex items-center gap-2">
                    {!noti.is_read && <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>}
                    <span className="text-base ">{noti.message}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(noti.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
