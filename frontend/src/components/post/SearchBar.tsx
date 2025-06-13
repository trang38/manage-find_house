import React, { useState } from 'react';

interface Props {
  onSearch: (term: string) => void;
}

const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [term, setTerm] = useState('');

  const handleSearch = () => {
    onSearch(term);
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Tìm kiếm tiêu đề bài đăng..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button onClick={handleSearch} className="bg-green-600 text-white rounded flex-none px-[0.5rem]">
        Tìm kiếm
      </button>
    </div>
  );
};

export default SearchBar;