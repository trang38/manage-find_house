import React, { useState } from "react";
import { Infor, searchUser, User } from ".././interface_type";

interface SearchUserProps {
  onSelect: (user: Infor) => void;
  excludeId?: any;
}

const SearchUser: React.FC<SearchUserProps> = ({ onSelect, excludeId }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Infor[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const users = await searchUser(query);
      setResults(users.filter(u => u.user?.id));
    } finally {
      setLoading(false);
    }
    console.log("Search results:", results);
  };

  return (
    <div>
      <div className="flex flex-row items-center">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tìm kiếm người dùng"
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          className="border pl-1 py-1 rounded"
        />
        <button onClick={handleSearch} className="ml-[0.3rem] px-2 py-1 border rounded w-[2rem] h-[2rem] flex-none">
          <img src={process.env.PUBLIC_URL + '/search-interface-symbol.png'} alt="Tìm" />
        </button>
      </div>

      {loading && <div>Đang tìm...</div>}
      <ul className="flex flex-col gap-[0.5rem] mt-[0.5rem]">
        {results.map(user => (
          <li key={user.id}>
            <button onClick={() => onSelect(user)} className="flex flex-row items-center gap-[0.5rem] hover:text-[#228B22]">
              <img src={user?.image instanceof File ? URL.createObjectURL(user?.image) : user?.image} alt={user.user?.username} className="w-[1.8rem] h-[1.8rem] rounded-full object-cover flex-0" />
              <span className="truncate w-[11rem] text-start max-w-[11.5rem]">{user.full_name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchUser;