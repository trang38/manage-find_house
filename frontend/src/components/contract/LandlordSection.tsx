import React from 'react';
import { City, District, Ward, User } from '../../components/interface_type';

interface LandlordSectionProps {
  data: User | undefined;
  editMode: boolean;
  editData: any;
  setEditData: (data: any) => void;
  addressHook: any;
  handleSave: () => void;
  handleCancel: () => void;
  isOwner: boolean;
  onEdit: () => void;
}

const LandlordSection: React.FC<LandlordSectionProps> = ({
  data,
  editMode,
  editData,
  setEditData,
  addressHook,
  handleSave,
  handleCancel,
  isOwner,
  onEdit,
}) => {
  return (
    <div className="landlord mt-[2rem]">
      <h2 className="font-bold uppercase flex items-center gap-[0.8rem]">
        Bên A (chủ phòng):
        {/* {isOwner && (
          editMode ? (
            <>
              <button className="ml-2 px-2 py-1 bg-green-500 text-white rounded" onClick={handleSave}>Lưu</button>
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
              <span className="font-semibold">Họ và tên:</span>
              <input className="border px-2" value={editData?.infor?.full_name || ''} onChange={e => setEditData((prev: any) => ({ ...prev, infor: { ...prev.infor, full_name: e.target.value } }))} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Số điện thoại:</span>
              <input className="border px-2" value={editData?.infor?.phone_number || ''} onChange={e => setEditData((prev: any) => ({ ...prev, infor: { ...prev.infor, phone_number: e.target.value } }))} required />
            </div>
            <div className="flex flex-row gap-[0.4rem] items-center">
              <span className="font-semibold">Thành phố:</span>
              <select className="border px-2" value={addressHook.selectedCityId ?? ''} onChange={e => addressHook.handleCityChange(e, setEditData)} required>
                <option value="">Chọn thành phố</option>
                {addressHook.cities.map((city: City) => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>
              <span className="font-semibold ml-2">Quận/Huyện:</span>
              <select className="border px-2" value={addressHook.selectedDistrictId ?? ''} onChange={e => addressHook.handleDistrictChange(e, setEditData)} required>
                <option value="">Chọn quận/huyện</option>
                {addressHook.districts.map((d: District) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <span className="font-semibold ml-2">Phường/Xã:</span>
              <select className="border px-2" value={addressHook.selectedWardId ?? ''} onChange={e => addressHook.handleWardChange(e, setEditData)} required>
                <option value="">Chọn phường/xã</option>
                {addressHook.wards.map((w: Ward) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Địa chỉ chi tiết:</span>
              <input className="border px-2" value={editData?.infor?.address_detail || ''} onChange={e => setEditData((prev: any) => ({ ...prev, infor: { ...prev.infor, address_detail: e.target.value } }))} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Số CMND/CCCD:</span>
              <input className="border px-2" value={editData?.infor?.national_id || ''} onChange={e => setEditData((prev: any) => ({ ...prev, infor: { ...prev.infor, national_id: e.target.value } }))} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Ngày cấp:</span>
              <input className="border px-2" type="date" value={editData?.infor?.national_id_date || ''} onChange={e => setEditData((prev: any) => ({ ...prev, infor: { ...prev.infor, national_id_date: e.target.value } }))} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Nơi cấp:</span>
              <input className="border px-2" value={editData?.infor?.national_id_address || ''} onChange={e => setEditData((prev: any) => ({ ...prev, infor: { ...prev.infor, national_id_address: e.target.value } }))} required />
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <span className="font-semibold">Ảnh CMND/CCCD mặt trước:</span>
              <img src={addressHook.frontImagePreview || (editData?.infor?.id_front_image instanceof File ? URL.createObjectURL(editData?.infor?.id_front_image) : editData?.infor?.id_front_image || process.env.PUBLIC_URL + '/no-photo.jpg')} alt="mặt trước cccd" className="w-[20rem] aspect-video object-cover border-[1px] ml-[1rem]" />
              <input type="file" name="id_front_image" accept="image/*" onChange={e => addressHook.handleFileChange(e, setEditData)} className="ml-[1rem]" />
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <span className="font-semibold">Ảnh CMND/CCCD mặt sau:</span>
              <img src={addressHook.backImagePreview || (editData?.infor?.id_back_image instanceof File ? URL.createObjectURL(editData?.infor?.id_back_image) : editData?.infor?.id_back_image || process.env.PUBLIC_URL + '/no-photo.jpg')} alt="mặt sau cccd" className="w-[20rem] aspect-video object-cover border-[1px] ml-[1rem]" />
              <input type="file" name="id_back_image" accept="image/*" onChange={e => addressHook.handleFileChange(e, setEditData)} className="ml-[1rem]" />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Tên ngân hàng:</span>
              <input className="border px-2" value={editData?.infor?.bank_name || ''} onChange={e => setEditData((prev: any) => ({ ...prev, infor: { ...prev.infor, bank_name: e.target.value } }))} />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Số tài khoản:</span>
              <input className="border px-2" value={editData?.infor?.bank_account || ''} onChange={e => setEditData((prev: any) => ({ ...prev, infor: { ...prev.infor, bank_account: e.target.value } }))} />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Tên tài khoản:</span>
              <input className="border px-2" value={editData?.infor?.bank_account_name || ''} onChange={e => setEditData((prev: any) => ({ ...prev, infor: { ...prev.infor, bank_account_name: e.target.value } }))} />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Họ và tên:</span>
              <span>{data?.infor?.full_name}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Số điện thoại:</span>
              <span>{data?.infor?.phone_number}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Địa chỉ:</span>
              <span>
                {data?.infor?.address_detail}
                {data?.infor?.ward
                  ? (typeof data.infor.ward === 'object'
                    ? `, ${(data.infor.ward as Ward).path_with_type}`
                    : '')
                  : ''}
              </span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Email:</span>
              <span>{data?.email}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Số CMND/CCCD:</span>
              <span>{data?.infor?.national_id}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Ngày cấp:</span>
              <span>{data?.infor?.national_id_date}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Nơi cấp:</span>
              <span>{data?.infor?.national_id_address}</span>
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <span className="font-semibold">Ảnh CMND/CCCD mặt trước:</span>
              <img src={data?.infor?.id_front_image instanceof File ? URL.createObjectURL(data?.infor?.id_front_image) : data?.infor?.id_front_image || process.env.PUBLIC_URL + '/no-photo.jpg'} alt="mặt trước cccd" className="w-[20rem] aspect-video object-cover border-[1px] ml-[1rem]" />
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <span className="font-semibold">Ảnh CMND/CCCD mặt sau:</span>
              <img src={data?.infor?.id_back_image instanceof File ? URL.createObjectURL(data?.infor?.id_back_image) : data?.infor?.id_back_image || process.env.PUBLIC_URL + '/no-photo.jpg'} alt="mặt sau cccd" className="w-[20rem] aspect-video object-cover border-[1px] ml-[1rem]" />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Tên ngân hàng:</span>
              <span>{data?.infor?.bank_name}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Số tài khoản:</span>
              <span>{data?.infor?.bank_account}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Tên tài khoản:</span>
              <span>{data?.infor?.bank_account_name}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LandlordSection;
