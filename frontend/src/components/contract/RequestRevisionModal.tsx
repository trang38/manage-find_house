import axios from 'axios';
import React, { useState } from 'react';
import { getCSRFToken } from '../../utils/cookies';

interface RequestRevisionModalProps {
  contractId: number;
  isOpen: boolean;
  onClose: () => void;
}

const csrftoken = getCSRFToken();
const RequestRevisionModal: React.FC<RequestRevisionModalProps> = ({ contractId, isOpen, onClose }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do chỉnh sửa.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/contracts/${contractId}/request_revision/`, {
        reason: reason.trim(),
      }, {
        withCredentials: true,
                  headers: {
            'X-CSRFToken': csrftoken || '',
          },
      });
      alert(response.data.message || 'Yêu cầu chỉnh sửa đã được gửi.');
      setReason('');
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Yêu cầu chỉnh sửa hợp đồng</h2>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 min-h-[100px] resize-y"
          placeholder="Nhập lý do chỉnh sửa..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestRevisionModal;