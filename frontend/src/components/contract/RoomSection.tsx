import React from 'react';
import { Room, ROOM_TYPE_MAP, Ward } from '../../components/interface_type';
import { formatPrice } from '../../pages/home';

interface RoomSectionProps {
  data: Room | undefined;
  editMode: boolean;
  editData: any;
  setEditData: (data: any) => void;
  handleSave: () => void;
  handleCancel: () => void;
  isOwner: boolean;
  onEdit: () => void;
  loading?: boolean;
}

const RoomSection: React.FC<RoomSectionProps> = ({
  data,
  editMode,
  editData,
  setEditData,
  handleSave,
  handleCancel,
  isOwner,
  onEdit,
  loading,
}) => {
  return (
    <div className="room mt-[2rem]">
      <h2 className="font-bold uppercase flex items-center gap-[0.8rem]">
        Thông tin phòng:
        {/* {isOwner && (
          editMode ? (
            <>
              <button
                className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                onClick={handleSave}
                disabled={!!loading}
              >Lưu</button>
              <button className="ml-2 px-2 py-1 bg-gray-400 text-white rounded" onClick={handleCancel}>Hủy</button>
            </>
          ) : (
            <button className="" onClick={onEdit}>
              <img src={process.env.PUBLIC_URL + '/edit.png'} alt="Chỉnh sửa" className="w-[1rem] h-[1rem]" />
            </button>
          )
        )} */}
      </h2>
      <div className="flex flex-col gap-[0.4rem] mt-[.5rem]">
        {editMode ? (
          <>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Loại phòng:</span>
              <select
                className="border px-2"
                value={editData?.room_type || ''}
                onChange={e => setEditData({ ...editData, room_type: e.target.value })}
                required
              >
                <option value="">Chọn loại phòng</option>
                {Object.entries(ROOM_TYPE_MAP).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Giá thuê:</span>
              <input className="border px-2" value={editData?.price || ''} onChange={e => setEditData({ ...editData, price: e.target.value })} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Số tiền đặt cọc:</span>
              <input className="border px-2" value={editData?.deposit || ''} onChange={e => setEditData({ ...editData, deposit: e.target.value })} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Diện tích:</span>
              <input className="border px-2" value={editData?.area || ''} onChange={e => setEditData({ ...editData, area: e.target.value })} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Tiền điện:</span>
              <input className="border px-2" value={editData?.electric || ''} onChange={e => setEditData({ ...editData, electric: e.target.value })} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Tiền nước:</span>
              <input className="border px-2" value={editData?.water || ''} onChange={e => setEditData({ ...editData, water: e.target.value })} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Tiền dịch vụ:</span>
              <input className="border px-2" value={editData?.service_price || ''} onChange={e => setEditData({ ...editData, service_price: e.target.value })} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Tiện nghi:</span>
              <input className="border px-2" value={editData?.amenities || ''} onChange={e => setEditData({ ...editData, amenities: e.target.value })} required />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Địa chỉ: </span>
              <span>{typeof data?.house === 'object' && typeof data?.house.ward === 'object' ? data?.house.address_detail + ', ' + data?.house.ward.path_with_type : ''}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Loại phòng: </span>
              <span>{data?.room_type ? ROOM_TYPE_MAP[data.room_type] : ''}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Giá thuê: </span>
              <span>{formatPrice(String(data?.price || 0))}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Số tiền đặt cọc: </span>
              <span>{formatPrice(String(data?.deposit || 0))}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Diện tích:</span>
              <span>{data?.area} m²</span>
            </div>
            <div>
              <span className="font-semibold">Tiền điện: </span>
              <span>{formatPrice(String(data?.electric || 0))}/số</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Tiền nước: </span>
              <span>{data?.water || 'Thỏa thuận'}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Tiền dịch vụ: </span>
              <span>{formatPrice(String(data?.service_price || 0))}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Tiện nghi: </span>
              <span>{data?.amenities || 'Không có'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomSection;
