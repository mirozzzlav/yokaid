import useCall from 'src/hooks/useCall';
import useAuthorizedCall from 'src/hooks/useAuthorizedCall';
import useLocalStorage from 'src/hooks/useLocalStorage';
import useMapPostsCall from 'src/hooks/useMapPostsCall';
import useForm from 'src/hooks/useForm';
import { useLoginCall, useSignupCall, useMenu } from 'src/hooks/useUser';
import useDelayedAction from 'src/hooks/useDelayedAction';

export {
  useCall,
  useLocalStorage,
  useMapPostsCall,
  useForm,
  useLoginCall,
  useSignupCall,
  useMenu,
  useAuthorizedCall,
  useDelayedAction,
};
