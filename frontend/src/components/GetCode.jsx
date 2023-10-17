import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import {
  ErrorMessage,
  InfoMessage,
  SuccessMessage,
} from 'src/components/Messages';
import FormGroup from 'src/components/FormGroup';
import React, { useState } from 'react';
import config from 'src/config';
import { getLocalDataValue, setLocalDataValue } from 'src/helpers';
import useCall from 'src/hooks/useCall';
import PropTypes from 'prop-types';

export default function GetCode({ paymentType, entityId, message }) {
  const [userPhone, setUserPhone] = useState(
    getLocalDataValue('localStorageInputs', config.userIdName) || '',
  );
  const [phoneError, setPhoneError] = useState(null);
  const [code, setCode] = useState('');

  const call = useCall((response) => {
    if (response.error) {
      setPhoneError(response.error.msg || 'Unknown error');
      setCode(response.data);
    } else {
      setPhoneError('');
      setCode(response.data.code);
      setLocalDataValue('localStorageInputs', config.userIdName, userPhone);
    }
  });

  return (
    <FormGroup>
      <FormControl>
        <InfoMessage message={message} />
      </FormControl>
      <FormControl>
        <FormLabel>Your phone</FormLabel>
        <Input
          value={userPhone}
          onChange={(e) => setUserPhone(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <Button
          onClick={() =>
            call(
              `${config.api.endPointsURLs.getCode}/${paymentType}/${entityId}${
                userPhone ? `/${userPhone}` : ''
              }`,
            )
          }
          variant="solid"
          colorScheme="blue"
        >
          Get code
        </Button>
      </FormControl>
      {phoneError ? <ErrorMessage message={phoneError} /> : null}
      {code ? <SuccessMessage message={`Your SMS code is ${code}`} /> : null}
    </FormGroup>
  );
}

GetCode.prototype.propTypes = {
  paymentType: PropTypes.string.isRequired,
  entityId: PropTypes.number.isRequired,
  massage: PropTypes.string.isRequired,
};
