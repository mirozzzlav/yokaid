import { useNavigate } from 'react-router-dom';

export default function Logout() {
  localStorage.clear();
  const navigate = useNavigate();

  navigate('/');

  return null;
}
