import { Bill } from "../interface_type";
import VietQRComponent from "./VietQR";
import { useAuthSessionQuery } from "../../django-allauth/sessions/hooks";
import axios from "axios";
import { toast } from "react-toastify";
import { getCSRFToken } from "../../utils/cookies";

interface BillDetailsProps {
  selectedBill: Bill,
  setShowBillModal: (show: boolean) => void,
}
const csrftoken = getCSRFToken();
const BillDetails: React.FC<BillDetailsProps> = ({
  selectedBill,
  setShowBillModal,
}) => {
  const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
  const isAuthenticated = authData?.isAuthenticated;
  const isOwner = isAuthenticated && selectedBill.contract.landlord.username === authData?.user?.username;

  const handleConfirmPaid = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/payments/${selectedBill.id}/mark_confirm_paid/`, {}, {
        withCredentials: true,
        headers: { 'X-CSRFToken': csrftoken || '' },
      });
      toast.success("Xác nhận đã thanh toán thành công!");
      setShowBillModal(false);
    } catch {
      toast.error("Lỗi khi xác nhận thanh toán!");
    }
  };

  const handleConfirmReceive = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/payments/${selectedBill.id}/mark_confirm_receive/`, {}, {
        withCredentials: true,
        headers: { 'X-CSRFToken': csrftoken || '' },
      });
      toast.success("Xác nhận đã nhận tiền thành công!");
      setShowBillModal(false);
    } catch {
      toast.error("Lỗi khi xác nhận đã nhận tiền!");
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[350px] max-w-[90vw] max-h-[calc(100vh-6.8rem)] overflow-auto mt-[2.5rem]">
        <h3 className="font-bold mb-2 text-lg">Chi tiết hóa đơn</h3>
        <div className="mb-2"><b>Ngày tạo:</b> {selectedBill.created_at?.split('T')[0]} {selectedBill.created_at?.split('T')[1].slice(0, 5)} | <b>Cập nhật: </b>{selectedBill.updated_at?.split('T')[0]} {selectedBill.updated_at?.split('T')[1].slice(0, 5)}</div>
        <div className="mb-2"><b>Tổng tiền: </b> {selectedBill.total_amount?.toLocaleString()} VNĐ</div>
        <div className="mb-2"><b>Tiền phòng: </b> {selectedBill.contract?.data?.room_price.toLocaleString()} VNĐ</div>
        <div className="mb-2"><b>Tiền dịch vụ: </b> {selectedBill.contract?.data?.room_service_price.toLocaleString()} VNĐ</div>
        <div className="mb-2"><b>Số điện: </b> {selectedBill.electric_num}</div>
        <div className="mb-2"><b>Tiền nước: </b> {selectedBill.water_fee?.toLocaleString()} VNĐ</div>
        <div className="mb-2"><b>Phí khác: </b> {selectedBill.extra_fees?.toLocaleString()} VNĐ</div>
        <div className="mb-2"><b>Nội dung: </b> {selectedBill.content}</div>
        <div className="mb-2"><b>Trạng thái: </b>
          {selectedBill.confirm_receive ? 'Đã thanh toán' : (
            selectedBill.confirm_paid ? 'Chưa xác nhận' : 'Chưa thanh toán'
          )}
        </div>
        {selectedBill.confirm_paid ? null : (
          <div>
            <VietQRComponent bill={selectedBill} />
          </div>
        )}
        <div className="flex flex-row gap-[1rem] mt-[1rem]">
          <button
            className="mt-4 px-4 py-2 bg-gray-400 text-white rounded"
            onClick={() => setShowBillModal(false)}
          >
            Đóng
          </button>
          {!isOwner && (
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded" onClick={handleConfirmPaid}>
              Đã thanh toán
            </button>
          )}
          {isOwner && (
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleConfirmReceive}>
              Đã nhận tiền
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillDetails;