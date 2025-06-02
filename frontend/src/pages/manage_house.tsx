import React, { useState } from "react";
import AddHouseForm from "../components/HouseForm";
import HousesList from "../components/HouseList";


const ManageHouse: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => setRefresh(prev => !prev);
  return (
    <div className="mx-auto px-[6rem] min-h-[calc(100vh-15.88rem)] mt-[7rem] mb-[3rem]">
      <h1 className="text-2xl font-bold mb-4 text-[#228B22]">Quản lý nhà trọ</h1>
      <button
        onClick={() => setShowForm(true)}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4 mt-[2rem]"
      >
        Thêm nhà trọ
      </button>

      {showForm && (
        <div className="border p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Nhập thông tin nhà</h2>
          <AddHouseForm onClose={() => setShowForm(false)} onSuccess={handleRefresh}/>
        </div>
      )}

      <div className="mt-[2rem]"><HousesList refresh={refresh}/></div>
    </div>
  );
};

export default ManageHouse;