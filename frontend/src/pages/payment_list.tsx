import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Bank, Bill, Contract, CONTRACT_STATUS_TYPE_MAP, Infor, Post, Room, User, VietQRRequest } from '../components/interface_type';
import { getCSRFToken } from '../utils/cookies';
import { useAuthSessionQuery } from '../django-allauth/sessions/hooks';
import { VietQR } from 'vietqr';
import VietQRComponent from '../components/bill/VietQR';
import BillDetails from '../components/bill/BillDetails';

const csrftoken = getCSRFToken();

const PaymentList: React.FC = () => {
  const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<'tenant' | 'landlord'>('tenant');
  const [landlordBills, setLandlordBills] = useState<Bill[]>([]);
  const [tenantBills, setTenantBills] = useState<Bill[]>([]);
  const [banks, setBanks] = useState<Bank[]>();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  const fetchLandlordBills = async () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/payments/landlord-bills/`, {
      withCredentials: true,
      headers: { 'X-CSRFToken': csrftoken || '' },
    })
      .then(res => {
        setLandlordBills(res.data);
      })
      .catch(() => {
        setLandlordBills([]);
      });
  }

  const fetchTenantBills = async () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/payments/tenant-bills/`, {
      withCredentials: true,
      headers: { 'X-CSRFToken': csrftoken || '' },
    })
      .then(res => {
        setTenantBills(res.data);
      })
      .catch(() => {
        setTenantBills([]);
      });
  }
  useEffect(() => {
    fetchLandlordBills();
    fetchTenantBills();
    axios.get(`${process.env.REACT_APP_API_URL}/api/profile/me/`, {
      withCredentials: true,
      headers: { 'X-CSRFToken': csrftoken || '' },
    }).then(res => setUser(res.data)).catch(() => setUser(null));
    axios.get('https://api.vietqr.io/v2/banks').then(res => setBanks(res.data.data));
  }, []);
  const isLandlord = user?.infor?.role === 'landlord';
  return (
    <div className="mx-auto min-h-[calc(100vh-15.88rem)] pt-[5rem] mb-[3rem] w-[1000px]">
      {isLandlord && (
        <div className="flex gap-[2rem] mb-6 justify-center">
          <button
            className=' text-[#228B22] hover:underline'
            onClick={() => setTab('tenant')}
          >
            Hóa đơn phải trả
          </button>
          <button
            className='text-[#228B22] hover:underline'
            onClick={() => setTab('landlord')}
          >
            Hóa đơn đã tạo
          </button>
        </div>
      )}

      {isLandlord ? (
        <>
          {tab === 'tenant' && (
            <div className="mt-[2rem]">
              <h2 className="font-bold text-xl flex items-center justify-center">Hóa đơn phải trả</h2>
              <ul className="flex flex-col gap-[1rem] mt-[2rem]">
                {tenantBills.map((bill) => (
                  <li key={bill.id} className="py-2 px-4 flex flex-col md:flex-row md:items-center md:justify-between border-[1px] shadow-lg rounded">
                    <div>
                      <span className="font-semibold">Phòng:</span> {bill.contract?.room.room_name} - Nhà: {typeof bill.contract?.room.house === 'object' && bill.contract?.room.house.name}<br />
                      <span className="font-semibold">Ngày tạo:</span> {bill.created_at?.split('T')[0]}<br />
                      <span className="font-semibold">Tổng tiền:</span> {bill.total_amount?.toLocaleString()} VNĐ<br />
                      <span className="font-semibold">Trạng thái:</span> {bill.confirm_paid ? "Đã thanh toán" : "Chưa thanh toán"}
                    </div>
                    <button
                      className="mt-2 md:mt-0 px-3 py-1 bg-blue-500 text-white rounded"
                      onClick={() => { setSelectedBill(bill); setShowBillModal(true); }}
                    >
                      Xem chi tiết
                    </button>
                  </li>
                ))}
                {tenantBills.length === 0 && (
                  <div className='mt-[2rem] flex items-center justify-center'>Bạn chưa có hóa đơn nào.</div>
                )}
              </ul>
            </div>
          )}
          {tab === 'landlord' && (
            <div className="mt-[2rem]">
              <h2 className="font-bold text-xl flex items-center justify-center">Hóa đơn đã tạo</h2>
              <ul className="flex flex-col gap-[1rem] mt-[2rem]">
                {landlordBills.map((bill) => (
                  <li key={bill.id} className="py-2 px-4 flex flex-col md:flex-row md:items-center md:justify-between border-[1px] shadow-lg rounded">
                    <div>
                      <span className="font-semibold">Phòng:</span> {bill.contract?.room.room_name} - Nhà: {typeof bill.contract?.room.house === 'object' && bill.contract?.room.house.name}<br />
                      <span className="font-semibold">Ngày tạo:</span> {bill.created_at?.split('T')[0]}<br />
                      <span className="font-semibold">Tổng tiền:</span> {bill.total_amount?.toLocaleString()} VNĐ<br />
                      <span className="font-semibold">Trạng thái:</span> {bill.confirm_paid ? "Đã thanh toán" : "Chưa thanh toán"}
                    </div>
                    <button
                      className="mt-2 md:mt-0 px-3 py-1 bg-blue-500 text-white rounded"
                      onClick={() => { setSelectedBill(bill); setShowBillModal(true); }}
                    >
                      Xem chi tiết
                    </button>
                  </li>
                ))}
                {landlordBills.length === 0 && (
                  <div className='mt-[2rem] flex items-center justify-center'>Bạn chưa có hóa đơn nào.</div>
                )}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="mt-[2rem]">
          <h2 className="font-bold text-xl flex items-center justify-center">Hóa đơn phải trả</h2>
          <ul className="flex flex-col gap-[1rem] mt-[2rem]">
            {tenantBills.map((bill) => (
              <li key={bill.id} className="py-2 px-4 flex flex-col md:flex-row md:items-center md:justify-between border-[1px] shadow-lg rounded">
                <div>
                  <span className="font-semibold">Phòng:</span> {bill.contract?.room.room_name} - Nhà: {typeof bill.contract?.room.house === 'object' && bill.contract?.room.house.name}<br />
                  <span className="font-semibold">Ngày tạo:</span> {bill.created_at?.split('T')[0]}<br />
                  <span className="font-semibold">Tổng tiền:</span> {bill.total_amount?.toLocaleString()} VNĐ<br />
                  <span className="font-semibold">Trạng thái:</span> {bill.confirm_paid ? "Đã thanh toán" : "Chưa thanh toán"}
                </div>
                <button
                  className="mt-2 md:mt-0 px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() => { setSelectedBill(bill); setShowBillModal(true); }}
                >
                  Xem chi tiết
                </button>
              </li>
            ))}
            {tenantBills.length === 0 && (
              <div className='mt-[2rem] flex items-center justify-center'>Bạn chưa có hóa đơn nào.</div>
            )}
          </ul>
        </div>
      )}

      {showBillModal && selectedBill && (
        <BillDetails selectedBill={selectedBill} setShowBillModal={setShowBillModal} />
      )}
    </div>
  );
};

export default PaymentList;
