import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Props {
  username: string;
}

const UserLink: React.FC<Props> = ({ username }) => {
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/profile/me/`, {
        withCredentials: true
    })
      .then(res => {
        setCurrentUsername(res.data.username);
      })
      .catch(() => {
        setCurrentUsername(null); 
      });
  }, []);

  const handleClick = () => {
    if (currentUsername === username) {
      navigate('/profile/me');
    } else {
      navigate(`/profile/${username}`);
    }
  };

  return (
    <button onClick={handleClick} className="text-blue-600 hover:underline">
      @{username}
    </button>
  );
};

export default UserLink;