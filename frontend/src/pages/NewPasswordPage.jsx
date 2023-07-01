import React, { useContext, useEffect } from 'react';
import { NewPassword } from 'src/components';
import { AuthContext } from 'src/providers';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isAuthorized } = useContext(AuthContext);
  useEffect(() => {
    if (isAuthorized) {
      navigate('/');
    }
  }, [isAuthorized]);
  return <NewPassword />;
}
