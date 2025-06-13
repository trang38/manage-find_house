import React from 'react';

interface ContractTermsSectionProps {
  data: any;
  editMode: boolean;
  editData: any;
  setEditData: (data: any) => void;
  handleSave: () => void;
  handleCancel: () => void;
  isOwner: boolean;
  onEdit: () => void;
}

const ContractTermsSection: React.FC<ContractTermsSectionProps> = ({
  data,
  editMode,
  editData,
  setEditData,
  handleSave,
  handleCancel,
  isOwner,
  onEdit,
}) => {
  return (
    <div className="terms mt-[2rem]">
      <h2 className="font-bold uppercase flex items-center gap-[0.8rem]">
        Điều khoản hợp đồng:
        {/* {isOwner && (
          editMode ? (
            <>
              <button className="ml-2 px-2 py-1 bg-green-500 text-white rounded" onClick={handleSave}>Lưu</button>
              <button className="ml-2 px-2 py-1 bg-gray-400 text-white rounded" onClick={handleCancel}>Hủy</button>
            </>
          ) : (
            <button className="w-[1rem] h-[1rem]" onClick={onEdit}>
              <img src={process.env.PUBLIC_URL + '/edit.png'} alt="Chỉnh sửa" className="w-[1rem] h-[1rem]" />
            </button>
          )
        )} */}
      </h2>
      <div className="flex flex-col gap-[0.4rem] mt-[.5rem]">
        {editMode ? (
          <>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Thời gian thuê:</span>
              <input className="border px-2" type='date' value={editData?.start_date || ''} onChange={e => setEditData({ ...editData, start_date: e.target.value })} required />
              <span>đến</span>
              <input className="border px-2" type='date' value={editData?.end_date || ''} onChange={e => setEditData({ ...editData, end_date: e.target.value })} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Ngày thanh toán hàng tháng:</span>
              <input className="border px-2" type="number" min={1} max={31} value={editData?.payment_day || ''} onChange={e => setEditData({ ...editData, payment_day: e.target.value.replace(/[^0-9]/g, '').slice(0,2) })} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Điều khoản bên A: </span>
              <textarea className="border px-2 w-full" value={editData?.terms_landlord || ''} onChange={e => setEditData({ ...editData, terms_landlord: e.target.value })} required />
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Điều khoản bên B: </span>
              <textarea className="border px-2 w-full" value={editData?.terms_tenant || ''} onChange={e => setEditData({ ...editData, terms_tenant: e.target.value })} required />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Thời gian thuê:</span>
              <span>ngày {data?.start_date || '...'} đến ngày {data?.end_date || '...'}</span>
            </div>
            <div className="flex flex-row gap-[0.4rem]">
              <span className="font-semibold">Ngày thanh toán hàng tháng:</span>
              <span>{data?.payment_day || '...'}</span>
            </div>
            <div>
              <span className="font-semibold">Điều khoản bên A: </span>
              <span>{data?.terms_landlord || '.....'}</span>
            </div>
            <div>
              <span className="font-semibold">Điều khoản bên B: </span>
              <span>{data?.terms_tenant || '.....'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContractTermsSection;
