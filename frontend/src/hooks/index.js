import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import useCall from 'src/hooks/useCall';
import useAuthorizedCall from 'src/hooks/useAuthorizedCall';
import useLocalStorage from 'src/hooks/useLocalStorage';
import { useGetProfessionals } from 'src/hooks/useProfessionals';
import useForms from 'src/hooks/useForms';
import { useLoginCall, useSignupCall } from 'src/hooks/useUser';
import useDelayedAction from 'src/hooks/useDelayedAction';
import usePlacesSearch from 'src/hooks/usePlacesSearch';

function useNavigateAction() {
  const navigate = useNavigate();
  const { action, actionParams } = useParams();
  return useMemo(
    () => ({
      navigate,
      action,
      actionParams,
      navigateAction: (newAction) =>
        navigate(newAction ? `/${newAction}` : '/'),
    }),
    [action, actionParams],
  );
}

export {
  useCall,
  useLocalStorage,
  useGetProfessionals,
  useForms,
  useLoginCall,
  useSignupCall,
  useAuthorizedCall,
  useDelayedAction,
  usePlacesSearch,
  useNavigateAction,
};
