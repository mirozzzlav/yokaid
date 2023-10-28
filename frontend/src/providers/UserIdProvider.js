import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  getLocalDataValue,
  getValidationError,
  isFieldRequired,
  setLocalDataValue,
} from 'src/helpers';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import config from 'src/config';

export const UserIdContext = React.createContext({});

export function UserIdFormControl({ error }) {
  const { label, inputFormat, validationRules } = config.userIdMeta;
  const { userId, setUserId, loadUserId } = useContext(UserIdContext);

  useEffect(() => {
    setUserId(loadUserId());
  }, []);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel>{label}</FormLabel>
      <Input
        isRequired={isFieldRequired(validationRules)}
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder={inputFormat}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}
UserIdFormControl.defaultProps = {
  error: '',
};
UserIdFormControl.prototype.propTypes = {
  error: PropTypes.string,
};

export default function UserIdProvider({ children }) {
  const loadUserId = useCallback(
    () => getLocalDataValue('localInputs', 'userId') || '',
    [],
  );
  const [userId, setUserId] = useState(loadUserId());
  const { name: userIdName, inputFormat } = config.userIdMeta;

  const contextVal = useMemo(
    () => ({
      userId,
      setUserId,
      saveUserId: () => setLocalDataValue('localInputs', 'userId', userId),
      loadUserId,
      getUserIdError: (validationErrors) => {
        const validationError =
          validationErrors &&
          Object.values(validationErrors).find(
            ({ field }) => field === userIdName,
          );
        return validationError
          ? getValidationError({ ...validationError, format: inputFormat })
          : '';
      },
    }),
    [userId],
  );

  return (
    <UserIdContext.Provider value={contextVal}>
      {children}
    </UserIdContext.Provider>
  );
}

UserIdProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
