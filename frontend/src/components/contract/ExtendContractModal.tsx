import React, { useState } from "react";

interface ExtendContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string) => void;
  currentEndDate: string;
}

const ExtendContractModal: React.FC<ExtendContractModalProps> = ({ isOpen, onClose, onSubmit, currentEndDate }) => {
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Gia hạn hợp đồng</h2>
        <div className="mb-4">Ngày kết thúc hiện tại: <b>{currentEndDate}</b></div>
        <input
          type="date"
          className="border px-2 py-1 rounded w-full mb-4"
          value={newDate}
          min={currentEndDate}
          onChange={e => setNewDate(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={onClose} disabled={loading}>Hủy</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => { if (newDate && newDate > currentEndDate) { setLoading(true); onSubmit(newDate); setLoading(false); } }} disabled={loading || !newDate || newDate <= currentEndDate}>
            {loading ? 'Đang gửi...' : 'Gia hạn'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtendContractModal;
