import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCSRFToken } from "../../utils/cookies";
import { Post } from ".././interface_type";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onUpdate: (updatedPost: Post) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onUpdate }) => {
  const [title, setTitle] = useState(post.title || "");
  const [loading, setLoading] = useState(false);
  const csrftoken = getCSRFToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/posts/${post.id}/`,
        { title, room: post.room.id }, 
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrftoken || "",
          },
        }
      );
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật bài đăng:", error);
      alert("Không thể cập nhật bài đăng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-green-700">Chỉnh sửa bài đăng</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-600">
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;