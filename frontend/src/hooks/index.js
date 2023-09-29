import useCall from 'src/hooks/useCall';
import useAuthorizedCall from 'src/hooks/useAuthorizedCall';
import useLocalStorage from 'src/hooks/useLocalStorage';
import {
  useGetProfessionals,
  useSearchProfessional,
} from 'src/hooks/useProfessionals';
import useForms from 'src/hooks/useForms';
import { useLoginCall, useSignupCall } from 'src/hooks/useUser';
import useDelayedAction from 'src/hooks/useDelayedAction';
import usePlacesSearch from 'src/hooks/usePlacesSearch';
import useNavigateAction from 'src/hooks/useNavigateAction';

export {
  useCall,
  useLocalStorage,
  useGetProfessionals,
  useSearchProfessional,
  useForms,
  useLoginCall,
  useSignupCall,
  useAuthorizedCall,
  useDelayedAction,
  usePlacesSearch,
  useNavigateAction,
};
