import React, { useContext, useEffect } from 'react';
import { Signup } from 'src/components';
import { AuthContext } from 'src/providers';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthorized } = useContext(AuthContext);
  useEffect(() => {
    if (isAuthorized) {
      navigate('/');
    }
  }, [isAuthorized]);
  return <Signup />;
}
