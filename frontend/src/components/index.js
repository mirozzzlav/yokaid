import { formFactory as loginFormFactory } from 'src/components/LoginForm';
import { formFactory as signupFormFactory } from 'src/components/SignupForm';
import { formFactory as createReviewFormFactory } from 'src/components/CreateReviewForm';
import ForgotPassword from 'src/components/ForgotPassword';
import NewPassword from 'src/components/NewPassword';
import Message, {
  ErrorMessage,
  SuccessMessage,
  InfoMessage,
} from 'src/components/Messages';
import FormModals from 'src/components/FormModals';
import { SearchDropdown, Dropdown } from 'src/components/Dropdown';
import Map from 'src/components/Map';
import DatePicker from 'src/components/DatePicker';
import ProfessionalInfo, {
  ProfessionalInfoModal,
} from 'src/components/ProfessionalInfo';
import Rating from 'src/components/Rating';
import MultiItem, { MultiInput } from 'src/components/MultiItem';
import DataContent from 'src/components/DataContent';
import SMSCodeControl from 'src/components/SMSCodeControl';

export {
  loginFormFactory,
  signupFormFactory,
  createReviewFormFactory,
  FormModals,
  ForgotPassword,
  NewPassword,
  Message,
  SearchDropdown,
  Dropdown,
  Map,
  DatePicker,
  ProfessionalInfo,
  ProfessionalInfoModal,
  Rating,
  MultiInput,
  MultiItem,
  DataContent,
  SMSCodeControl,
  ErrorMessage,
  InfoMessage,
  SuccessMessage,
};
