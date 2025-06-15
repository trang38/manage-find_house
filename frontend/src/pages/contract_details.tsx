import { useEffect, useState } from "react";
import { Bank, Bill, City, Contract, CONTRACT_STATUS_TYPE_MAP, District, Room, User, Ward } from "../components/interface_type";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getCSRFToken } from "../utils/cookies";
import { useAuthSessionQuery } from "../django-allauth/sessions/hooks";
import { toast } from "react-toastify";
import LandlordSection from '../components/contract/LandlordSection';
import TenantSection from '../components/contract/TenantSection';
import RoomSection from '../components/contract/RoomSection';
import ContractTermsSection from '../components/contract/ContractTermsSection';
import RequestRevisionModal from "../components/contract/RequestRevisionModal";
import ExtendContractModal from "../components/contract/ExtendContractModal";
import VietQRComponent from "../components/bill/VietQR";
import BillDetails from "../components/bill/BillDetails";
import { ContractReviewSection } from "../components/review/ReviewSection";

const csrftoken = getCSRFToken();
const ContractDetail = () => {
  const { id } = useParams();
  const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
  const isAuthenticated = authData?.isAuthenticated;
  const [contract, setContract] = useState<Contract>();
  const [tenant, setTenant] = useState<User>();
  const [landlord, setLandlord] = useState<User>();
  const [room, setRoom] = useState<Room>();
  const navigate = useNavigate();
  const [banks, setBanks] = useState<Bank[]>([]);
  const isOwner = isAuthenticated && contract?.landlord.username === authData?.user?.username;
  const [editMode, setEditMode] = useState<{ tenant: boolean, landlord: boolean, room: boolean, contract: boolean }>({ tenant: false, landlord: false, room: false, contract: false });
  const [tenantEdit, setTenantEdit] = useState<any>({});
  const [landlordEdit, setLandlordEdit] = useState<any>({});
  const [roomEdit, setRoomEdit] = useState<any>({});
  const [contractEdit, setContractEdit] = useState<any>({});
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [billForm, setBillForm] = useState({ electric_num: '', water_fee: '', extra_fees: '', content: '' });
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  // Function to reload contract details
  const fetchContractDetails = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/contracts/${id}/`, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrftoken || '',
        }
      });
      setContract(res.data);
      // Reload room
      if (res.data.room) {
        const roomRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/rooms/${res.data.room.id}/`, {
          withCredentials: true,
          headers: { 'X-CSRFToken': csrftoken || '' },
        });
        setRoom(roomRes.data);
      }
      // Reload landlord, tenant

      const isOwner = isAuthenticated && res.data.landlord.username === authData?.user?.username;

      if (res.data.tenant && res.data.landlord) {
        if (isOwner) {
          const landlordRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/me/`, {
            withCredentials: true,
            headers: { 'X-CSRFToken': csrftoken || '' },
          });
          setLandlord(landlordRes.data);
          const tenantRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/users/${res.data.tenant.username}`, {
            withCredentials: true,
            headers: { 'X-CSRFToken': csrftoken || '' },
          });
          setTenant(tenantRes.data);
        } else {
          const landlordRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/users/${res.data.landlord.username}`, {
            withCredentials: true,
            headers: { 'X-CSRFToken': csrftoken || '' },
          });
          setLandlord(landlordRes.data);
          const tenantRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/me/`, {
            withCredentials: true,
            headers: { 'X-CSRFToken': csrftoken || '' },
          });
          setTenant(tenantRes.data);
        }
      }
    } catch (error) {
      toast.error('Không thể tải lại thông tin hợp đồng!');
    }
  };

  useEffect(() => {
    fetchContractDetails();
    axios.get('https://api.vietqr.io/v2/banks').then(res => setBanks(res.data.data));
  }, [id]);

  // Custom hook to select address và upload image (used for landlord/tenant)
  function useAddressAndImageEdit(initEdit: any) {
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
    const [selectedWardId, setSelectedWardId] = useState<number | null>(null);
    const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null);
    const [backImagePreview, setBackImagePreview] = useState<string | null>(null);

    // Load cities/districts/wards when open form edit
    const preload = (edit: any) => {
      axios.get(`${process.env.REACT_APP_API_URL}/api/address/cities`).then(res => setCities(res.data));
      const cityId = edit?.infor?.city || null;
      setSelectedCityId(cityId);
      if (cityId) {
        axios.get(`${process.env.REACT_APP_API_URL}/api/address/city/${cityId}`).then(res => setDistricts(res.data.districts));
      }
      const districtId = edit?.infor?.district || null;
      setSelectedDistrictId(districtId);
      if (districtId) {
        axios.get(`${process.env.REACT_APP_API_URL}/api/address/district/${districtId}`).then(res => setWards(res.data.wards));
      }
      setSelectedWardId(typeof edit?.infor?.ward === 'object' && edit?.infor?.ward !== null ? edit.infor.ward.id : edit?.infor?.ward || null);
      setFrontImagePreview(null);
      setBackImagePreview(null);
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>, setEdit: any) => {
      const cityId = parseInt(e.target.value, 10);
      setSelectedCityId(cityId);
      setEdit((prev: any) => ({ ...prev, infor: { ...prev.infor, city: cityId, district: null, ward: null } }));
      setDistricts([]); setWards([]);
      setSelectedDistrictId(null); setSelectedWardId(null);
      if (cityId) {
        axios.get(`${process.env.REACT_APP_API_URL}/api/address/city/${cityId}`).then(res => setDistricts(res.data.districts));
      }
    };
    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>, setEdit: any) => {
      const districtId = parseInt(e.target.value, 10);
      setSelectedDistrictId(districtId);
      setEdit((prev: any) => ({ ...prev, infor: { ...prev.infor, district: districtId, ward: null } }));
      setWards([]); setSelectedWardId(null);
      if (districtId) {
        axios.get(`${process.env.REACT_APP_API_URL}/api/address/district/${districtId}`).then(res => setWards(res.data.wards));
      }
    };
    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>, setEdit: any) => {
      const wardId = parseInt(e.target.value, 10);
      setSelectedWardId(wardId);
      setEdit((prev: any) => ({ ...prev, infor: { ...prev.infor, ward: wardId } }));
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setEdit: any) => {
      const { name, files } = e.target;
      if (files && files.length > 0) {
        setEdit((prev: any) => ({ ...prev, infor: { ...prev.infor, [name]: files[0] } }));
        if (name === 'id_front_image') setFrontImagePreview(URL.createObjectURL(files[0]));
        if (name === 'id_back_image') setBackImagePreview(URL.createObjectURL(files[0]));
      }
    };
    return {
      cities, districts, wards,
      selectedCityId, selectedDistrictId, selectedWardId,
      frontImagePreview, backImagePreview,
      preload, handleCityChange, handleDistrictChange, handleWardChange, handleFileChange
    };
  }

  const landlordAddress = useAddressAndImageEdit(landlordEdit);
  useEffect(() => { if (editMode.landlord) landlordAddress.preload(landlordEdit); }, [editMode.landlord]);

  const tenantAddress = useAddressAndImageEdit(tenantEdit);
  useEffect(() => { if (editMode.tenant) tenantAddress.preload(tenantEdit); }, [editMode.tenant]);

  const handleSaveTenant = async () => {
    // Validate các trường bắt buộc
    const info = tenantEdit?.infor || {};
    if (!info.full_name || !info.phone_number || !info.city || !info.district || !info.ward || !info.address_detail || !info.national_id || !info.national_id_date || !info.national_id_address) {
      toast.error('Vui lòng nhập đầy đủ thông tin người thuê!');
      return;
    }
    // Validate ảnh
    if (!info.id_front_image || !info.id_back_image) {
      toast.error('Vui lòng chọn đủ ảnh CCCD mặt trước và mặt sau!');
      return;
    }
    const formData = new FormData();
    formData.append('full_name', info.full_name);
    formData.append('phone_number', info.phone_number);
    formData.append('city', info.city);
    formData.append('district', info.district);
    formData.append('ward', info.ward.id);
    formData.append('address_detail', info.address_detail);
    formData.append('national_id', info.national_id);
    formData.append('national_id_date', info.national_id_date);
    formData.append('national_id_address', info.national_id_address);
    formData.append('bank_name', info.bank_name || '');
    formData.append('bank_account', info.bank_account || '');
    formData.append('bank_account_name', info.bank_account_name || '');
    if (info.id_front_image instanceof File) formData.append('id_front_image', info.id_front_image);
    if (info.id_back_image instanceof File) formData.append('id_back_image', info.id_back_image);
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/profile/me/`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrftoken || '',
        },
      });
      toast.success('Cập nhật thông tin người thuê thành công!');
      setEditMode((prev: any) => ({ ...prev, tenant: false }));

      fetchContractDetails();
    } catch (err) {
      toast.error('Cập nhật thông tin người thuê thất bại!');
    }
  };

  async function handleSaveRoom() {
    console.log('handleSaveRoom called', roomEdit);
    // Validate required fields
    const info = roomEdit || {};
    if (!info.id) {
      toast.error('Không xác định được phòng cần cập nhật!');
      return;
    }
    if (!info.room_type || !info.price || !info.deposit || !info.area || !info.electric || !info.water || !info.service_price) {
      toast.error('Vui lòng nhập đầy đủ thông tin phòng!');
      return;
    }
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/rooms/${info.id}/`,
        {
          house: typeof room?.house === "object" && room?.house !== null && "id" in room.house ? room.house.id : room?.house || null,
          room_name: info.room_name,
          status: info.status,
          room_type: info.room_type,
          price: info.price,
          deposit: info.deposit,
          area: info.area,
          electric: info.electric,
          water: info.water,
          service_price: info.service_price,
          amenities: info.amenities,
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          },
        }
      );
      toast.success('Cập nhật thông tin phòng thành công!');
      setEditMode((prev: any) => ({ ...prev, room: false }));
      // Reload room data
      if (contract?.room) {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/rooms/${contract.room.id}/`, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          }
        });
        setRoom(res.data);
      }
    } catch (err: any) {
      if (err.response) {
        toast.error('Lỗi: ' + (err.response.data?.detail || JSON.stringify(err.response.data)));
      } else {
        toast.error('Cập nhật thông tin phòng thất bại!');
      }
      console.error('Room update error:', err);
    }
  }

  async function handleSaveLandlord() {
    const info = landlordEdit?.infor || {};
    if (
      !info.full_name ||
      !info.phone_number ||
      !info.city ||
      !info.district ||
      !info.ward ||
      !info.address_detail ||
      !info.national_id ||
      !info.national_id_date ||
      !info.national_id_address
    ) {
      toast.error('Vui lòng nhập đầy đủ thông tin chủ phòng!');
      return;
    }
    if (!info.id_front_image || !info.id_back_image) {
      toast.error('Vui lòng chọn đủ ảnh CCCD mặt trước và mặt sau!');
      return;
    }
    const formData = new FormData();
    formData.append('full_name', info.full_name);
    formData.append('phone_number', info.phone_number);
    formData.append('city', info.city);
    formData.append('district', info.district);
    formData.append('ward', info.ward.id);
    formData.append('address_detail', info.address_detail);
    formData.append('national_id', info.national_id);
    formData.append('national_id_date', info.national_id_date);
    formData.append('national_id_address', info.national_id_address);
    if (info.id_front_image instanceof File) formData.append('id_front_image', info.id_front_image);
    if (info.id_back_image instanceof File) formData.append('id_back_image', info.id_back_image);
    formData.append('bank_name', info.bank_name || '');
    formData.append('bank_account', info.bank_account || '');
    formData.append('bank_account_name', info.bank_account_name || '');
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/profile/me/`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRFToken': csrftoken || '',
          },
        }
      );
      toast.success('Cập nhật thông tin chủ phòng thành công!');
      setEditMode((prev: any) => ({ ...prev, landlord: false }));
      fetchContractDetails();
    } catch (err) {
      toast.error('Cập nhật thông tin chủ phòng thất bại!');
    }
  }

  async function handleSaveContract() {
    const info = contractEdit || {};
    if (!info.start_date || !info.end_date || !info.payment_day) {
      toast.error('Vui lòng nhập đầy đủ thông tin điều khoản hợp đồng!');
      return;
    }
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/contracts/${contractEdit.id}/`,
        {
          landlord: contractEdit.landlord.id || contract?.landlord.id,
          tenant: contractEdit.tenant.id || contract?.tenant.id,
          room: contractEdit.room.id || contract?.room.id,
          start_date: info.start_date,
          end_date: info.end_date,
          payment_day: info.payment_day ? parseInt(info.payment_day, 10) : undefined,
          terms_landlord: info.terms_landlord,
          terms_tenant: info.terms_tenant,
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          },
        }
      );
      toast.success('Cập nhật điều khoản hợp đồng thành công!');
      setEditMode((prev: any) => ({ ...prev, contract: false }));
      fetchContractDetails();
    } catch (err) {
      toast.error('Cập nhật điều khoản hợp đồng thất bại!');
    }
  }

  const handleMarkCompleted = async () => {
    if (isOwner) {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/contracts/${contract?.id}/mark_landlord_completed/`, {},
          {
            withCredentials: true,
            headers: {
              'X-CSRFToken': csrftoken || '',
            },
          });
        fetchContractDetails();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Có lỗi xảy ra');
      }
    } else {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/contracts/${contract?.id}/mark_tenant_completed/`, {}, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          },
        });
        fetchContractDetails();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Có lỗi xảy ra');
      }
    }
  }

  const approveFinal = async () => {
    if (isOwner) {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/contracts/${contract?.id}/approve_final_landlord/`, {}, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          },
        });
        fetchContractDetails();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Có lỗi xảy ra');
      }
    } else {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/contracts/${contract?.id}/approve_final_tenant/`, {}, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          },
        });
        fetchContractDetails();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Có lỗi xảy ra');
      }
    }
  }

  const cancel = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/contracts/${contract?.id}/cancel/`, {}, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrftoken || '',
        },
      });
      fetchContractDetails();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  }

  const handleExtend = async (newEndDate: string) => {
    if (!contract?.id) return;
    if (!newEndDate || !contract.end_date || newEndDate <= contract.end_date) {
      toast.error('Ngày kết thúc mới phải lớn hơn ngày cũ!');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/contracts/${contract.id}/extend/`, { new_end_date: newEndDate }, {
        withCredentials: true,
        headers: { 'X-CSRFToken': csrftoken || '' },
      });
      toast.success('Gia hạn hợp đồng thành công!');
      setShowExtendModal(false);
      fetchContractDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gia hạn hợp đồng thất bại!');
    }
  };

  const fetchBills = async () => {
    if (!contract?.id) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/payments/?contract=${contract.id}`, {
        withCredentials: true,
        headers: { 'X-CSRFToken': csrftoken || '' },
      });
      setBills(res.data);
    } catch (err) {
      toast.error('Không thể tải danh sách hóa đơn!');
    }
  };

  useEffect(() => {
    if (contract?.id) fetchBills();
  }, [contract?.id]);

  const handleCreateBill = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/payments/`, {
        contract: contract?.id,
        electric_num: billForm.electric_num ? Number(billForm.electric_num) : 0,
        water_fee: billForm.water_fee ? Number(billForm.water_fee) : 0,
        extra_fees: billForm.extra_fees ? Number(billForm.extra_fees) : 0,
        content: billForm.content,
      }, {
        withCredentials: true,
        headers: { 'X-CSRFToken': csrftoken || '' },
      });
      toast.success('Tạo hóa đơn thành công!');
      setShowCreateBill(false);
      setBillForm({ electric_num: '', water_fee: '', extra_fees: '', content: '' });
      fetchBills();
    } catch (err) {
      toast.error('Tạo hóa đơn thất bại!');
    }
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-15.88rem)] pt-[7rem] mb-[3rem] w-fit flex flex-row max-xl:flex-col">
      <div className="w-[1000px] max-lg:max-w-[100%] max-lg:px-[1.5rem]">
        {/* header of contract */}
        <div className="flex flex-col max-auto items-center justify-center">
          <h1 className="font-bold text-2xl uppercase">Thông tin hợp đồng</h1>
          <small>Mã HD: HD-{contract?.created_at.split('T')[0].split('-').join('')}-{contract?.id}</small>
          <div className="flex flex-row gap-[0.4rem]">
            <span className="">Trạng thái:</span>
            <span>{contract?.status ? CONTRACT_STATUS_TYPE_MAP[contract.status] : ''}</span>
          </div>
        </div>
        <LandlordSection
          data={landlord}
          banks={banks}
          editMode={editMode.landlord}
          editData={landlordEdit}
          setEditData={setLandlordEdit}
          addressHook={landlordAddress}
          handleSave={handleSaveLandlord}
          handleCancel={() => {
            setEditMode(prev => ({ ...prev, landlord: false }));
            setLandlordEdit(landlord); // reset edit data
          }}
          isOwner={!!isOwner}
          // landlordWards={landlordWards}
          onEdit={() => {
            setEditMode(prev => ({ ...prev, landlord: true }));
            setLandlordEdit(landlord);
          }}
        />
        <TenantSection
          data={tenant}
          banks={banks}
          editMode={editMode.tenant}
          editData={tenantEdit}
          setEditData={setTenantEdit}
          addressHook={tenantAddress}
          handleSave={handleSaveTenant}
          handleCancel={() => {
            setEditMode(prev => ({ ...prev, tenant: false }));
            setTenantEdit(tenant);
          }}
          isOwner={!!isOwner}
          // tenantWards={tenantWards}
          onEdit={() => {
            setEditMode(prev => ({ ...prev, tenant: true }));
            setTenantEdit(tenant);
          }}
        />
        <RoomSection
          data={room}
          editMode={editMode.room}
          editData={roomEdit}
          setEditData={setRoomEdit}
          handleSave={handleSaveRoom}
          handleCancel={() => {
            setEditMode(prev => ({ ...prev, room: false }));
            setRoomEdit(room);
          }}
          isOwner={!!isOwner}
          // roomWards={roomWards}
          onEdit={() => {
            if (room && room.id) {
              setEditMode(prev => ({ ...prev, room: true }));
              setRoomEdit(room);
            } else {
              toast.error('Không có dữ liệu phòng để chỉnh sửa!');
            }
          }}
        />
        <ContractTermsSection
          data={contract}
          editMode={editMode.contract}
          editData={contractEdit}
          setEditData={setContractEdit}
          handleSave={handleSaveContract}
          handleCancel={() => {
            setEditMode(prev => ({ ...prev, contract: false }));
            setContractEdit(contract);
          }}
          isOwner={!!isOwner}
          onEdit={() => {
            setEditMode(prev => ({ ...prev, contract: true }));
            setContractEdit(contract);
          }}
        />

        {/* note of contract when contarct has request revision */}
        <div>
          {contract?.revision_requested_tenant === true && (
            <div key="tenant-revision" className="text-sm italic text-red-300 mt-[2rem]">
              {isOwner ? contract?.tenant.infor.full_name : 'Bạn đã'} yêu cầu bạn chỉnh sửa hợp đồng {contract?.revision_reason ? ': ' + contract?.revision_reason : ''}
            </div>
          )}
          {contract?.revision_requested_landlord === true && (
            <div key="landlord-revision" className="text-sm italic text-red-300 mt-[2rem]">
              {!isOwner ? contract?.landlord.infor.full_name : 'Bạn đã'} yêu cầu bạn chỉnh sửa hợp đồng {contract?.revision_reason ? ': ' + contract?.revision_reason : ''}
            </div>
          )}
        </div>

        {/* buttons for create, extend,cancel contract */}
        <div className="flex items-center justify-center gap-2 mt-[2rem]">
          {['canceled', 'end'].includes(contract?.status || '') ? null : (
            <>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded font-semibold"
                onClick={() => { cancel() }}
              >
                Hủy hợp đồng
              </button>
            </>
          )}
          {contract?.status === 'creating' && (
            <>
              {contract?.landlord_completed === true && contract?.tenant_completed === true && (
                <button className="px-4 py-2 bg-[#00b14f] text-white rounded font-semibold" onClick={() => { approveFinal() }}>
                  Xác nhận hợp đồng hoàn chỉnh
                </button>
              )}
              {isOwner && contract?.landlord_completed === false && !editMode.landlord && !editMode.room && !editMode.contract && (
                <button
                  className="px-4 py-2 bg-[#00b14f] text-white rounded font-semibold"
                  onClick={() => {
                    setEditMode({ landlord: true, room: true, contract: true, tenant: false });
                    setLandlordEdit(landlord);
                    if (room && room.id) {
                      setRoomEdit(room);
                    } else {
                      setRoomEdit({});
                      toast.error('Không có dữ liệu phòng để chỉnh sửa!');
                    }
                    setContractEdit(contract);
                  }}
                >
                  Chỉnh sửa
                </button>
              )}
              {isOwner && contract?.landlord_completed === false && (editMode.landlord || editMode.room || editMode.contract) && (
                <>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded font-semibold"
                    onClick={async () => {
                      await handleSaveLandlord();
                      await handleSaveRoom();
                      await handleSaveContract();
                      setEditMode({ landlord: false, room: false, contract: false, tenant: false });
                      handleMarkCompleted();
                    }}
                  >
                    Lưu
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-400 text-white rounded font-semibold"
                    onClick={() => {
                      setEditMode({ landlord: false, room: false, contract: false, tenant: false });
                      setLandlordEdit(landlord);
                      setRoomEdit(room);
                      setContractEdit(contract);
                    }}
                  >
                    Hủy
                  </button>
                </>
              )}
              {isOwner && contract?.tenant_completed === true && (
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded font-semibold"
                  onClick={() => setShowRevisionModal(true)}
                >
                  Yêu cầu sửa lại hợp đồng
                </button>
              )}
              {!isOwner && contract?.tenant_completed === false && (
                editMode.tenant ? (
                  <>
                    <button className="ml-2 px-2 py-1 bg-green-500 text-white rounded" onClick={async () => { handleSaveTenant(); handleMarkCompleted(); }}>Xác nhận</button>
                    <button className="ml-2 px-1 py-1 bg-gray-400 text-white rounded" onClick={() => {
                      setEditMode(prev => ({ ...prev, tenant: false }));
                      setTenantEdit(tenant);
                    }}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button className="px-4 py-2 bg-[#00b14f] text-white rounded font-semibold" onClick={() => { setEditMode(prev => ({ ...prev, tenant: true })); setTenantEdit(tenant); }}>
                      chỉnh sửa
                    </button>
                  </>
                )
              )}
              {!isOwner && contract?.landlord_completed === true && (
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded font-semibold"
                  onClick={() => setShowRevisionModal(true)}
                >
                  Yêu cầu sửa lại hợp đồng
                </button>
              )}
            </>
          )
          }
          {isOwner && contract?.status === 'completed' && (
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 bg-yellow-400 text-white rounded font-semibold"
                onClick={() => setShowExtendModal(true)}
              >
                Gia hạn hợp đồng
              </button>

            </div>
          )}
          <RequestRevisionModal
            contractId={contract?.id ?? 0}
            isOpen={showRevisionModal}
            onClose={() => setShowRevisionModal(false)}
          />
          <ExtendContractModal
            isOpen={showExtendModal}
            onClose={() => setShowExtendModal(false)}
            onSubmit={handleExtend}
            currentEndDate={contract?.end_date || ''}
          />
        </div>

        {/* create bill and show bills of contract when status of contract is completed */}
        <div className="mt-[2rem]">
          {isOwner && contract?.status === 'completed' && (
            <button
              className="px-4 py-2 bg-green-500 text-white rounded font-semibold"
              onClick={() => setShowCreateBill(true)}
            >
              Tạo hóa đơn
            </button>
          )}
          {['canceled', 'creating'].includes(contract?.status || '') ? null : (
            <>
              {bills.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-bold text-lg mb-2">Danh sách hóa đơn</h2>
                  <ul className="flex flex-col gap-[1rem]">
                    {bills.map((bill) => (
                      <li key={bill.id} className="py-2 px-4 flex flex-col md:flex-row md:items-center md:justify-between border-[1px] shadow-lg rounded">
                        <div>
                          <span className="font-semibold">Ngày tạo:</span> {bill.created_at?.split('T')[0]}<br />
                          <span className="font-semibold">Tổng tiền:</span> {bill.total_amount?.toLocaleString()} VNĐ<br />
                          <span className="font-semibold">Trạng thái:</span> {bill.confirm_receive ? 'Đã thanh toán' : (
                            bill.confirm_paid ? 'Chưa xác nhận' : 'Chưa thanh toán'
                          )}
                        </div>
                        <button
                          className="mt-2 md:mt-0 px-3 py-1 bg-blue-500 text-white rounded"
                          onClick={() => { setSelectedBill(bill); setShowBillModal(true); }}
                        >
                          Xem chi tiết
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          {showCreateBill && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
                <h3 className="font-bold mb-2">Tạo hóa đơn mới</h3>
                <input
                  type="number"
                  placeholder="Số điện"
                  className="border p-1 mb-2 w-full"
                  value={billForm.electric_num}
                  onChange={e => setBillForm(f => ({ ...f, electric_num: e.target.value }))}
                />
                <input
                  type="number"
                  placeholder="Tiền nước"
                  className="border p-1 mb-2 w-full"
                  value={billForm.water_fee}
                  onChange={e => setBillForm(f => ({ ...f, water_fee: e.target.value }))}
                />
                <input
                  type="number"
                  placeholder="Phí khác"
                  className="border p-1 mb-2 w-full"
                  value={billForm.extra_fees}
                  onChange={e => setBillForm(f => ({ ...f, extra_fees: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Nội dung"
                  className="border p-1 mb-2 w-full"
                  value={billForm.content}
                  onChange={e => setBillForm(f => ({ ...f, content: e.target.value }))}
                />
                {(() => {
                  const roomPrice = contract?.data?.room_price || 0;
                  const roomServicePrice = contract?.data?.room_service_price || 0;
                  const electricPrice = contract?.data?.room_electric || 0;
                  const electricNum = Number(billForm.electric_num) || 0;
                  const waterFee = Number(billForm.water_fee) || 0;
                  const extraFees = Number(billForm.extra_fees) || 0;
                  const total = Number(roomPrice) + Number(electricPrice) * electricNum + waterFee + extraFees + Number(roomServicePrice);
                  return (
                    <div className="mb-2 font-semibold text-blue-700">
                      Tổng tiền: {total.toLocaleString()} VNĐ
                    </div>
                  );
                })()}
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    onClick={() => { handleCreateBill() }}
                  >
                    Tạo hóa đơn
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                    onClick={() => setShowCreateBill(false)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
          {showBillModal && selectedBill && (
            <BillDetails selectedBill={selectedBill} setShowBillModal={setShowBillModal} />
          )}
        </div>

        {/* review and feedback of contract */}
        <div>
          {['canceled', 'creating'].includes(contract?.status || '') ? null : (
            <ContractReviewSection contract={contract} isOwner={!!isOwner} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetail;
