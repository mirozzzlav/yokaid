import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { isFieldRequired, unknownObjectValidator } from 'src/helpers';
import PropTypes from 'prop-types';
import theme from 'src/style';
import { useCall, useLocalStorage } from 'src/hooks';
import config from 'src/config';
import {
  ErrorMessage,
  InfoMessage,
  SuccessMessage,
} from 'src/components/Messages';
import { InitialDataContext } from 'src/providers';

const style = {
  wrapper: {
    padding: `${theme.space[4]} ${theme.space[6]} ${theme.space[6]} ${theme.space[6]}`,
    border: `1px solid ${theme.colors.gray[200]}`,
    boxShadow: theme.shadows.sm,
    marginBottom: theme.space[5],
    borderRadius: theme.radii.md,
  },
  heading: {
    marginBottom: theme.space[3],
    fontSize: '1.1rem',
    fontWeight: theme.fontWeights.medium,
  },
  message: {
    margin: '0.5rem 0',
  },
};

export default function SMSCodeControl({
  inputsErrors,
  inputs,
  inputsUpdater,
  validationRules,
  formState,
}) {
  const { setLocalDataValue, getLocalDataValue } = useLocalStorage();
  const [phone, setPhone] = useState('');
  const [callGetCodeError, setCallGetCodeError] = useState(null);

  const callGetCode = useCall((response) => {
    if (!response.error) {
      inputsUpdater('verificationPhone', phone);
      setLocalDataValue('smsCodeControl', 'phone', phone);
      setCallGetCodeError('');
    } else {
      setCallGetCodeError(response.error.msg);
    }
  });
  const { inputFormats } = useContext(InitialDataContext);

  useEffect(() => {
    const localDataPhone = getLocalDataValue('smsCodeControl', 'phone');
    if (localDataPhone) {
      setPhone(localDataPhone);
      inputsUpdater('verificationPhone', localDataPhone);
    }
  }, []);

  useEffect(() => {
    setCallGetCodeError(null);
    if (formState.isSuccess) {
      setPhone('');
      inputsUpdater('verificationPhone', '');
      setLocalDataValue('smsCodeControl', 'phone', '');
    }
  }, [formState.isSuccess, formState.isError]);

  const onGetCodeClick = useCallback(() => {
    callGetCode(
      `${config.api.endPointsURLs.getCode}${phone ? `/${phone}` : ''}`,
    );
  }, [phone]);

  return (
    <Box sx={style.wrapper}>
      <Heading sx={style.heading}>Code verification</Heading>
      {inputs.verificationPhone &&
        (callGetCodeError || callGetCodeError === null) && (
          <Box sx={style.message}>
            <InfoMessage
              message={`You have an unused SMS code that has been sent to the phone number ${inputs.verificationPhone}. You can go ahead and use it here.`}
            />
          </Box>
        )}
      <FormControl>
        <FormLabel>Your Phone</FormLabel>
        <InputGroup>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={inputFormats?.phone}
          />
          <InputRightElement sx={{ width: 'auto' }}>
            <Button onClick={onGetCodeClick}>Get code</Button>
          </InputRightElement>
        </InputGroup>
        <Box sx={style.message}>
          {!callGetCodeError && callGetCodeError !== null && (
            <SuccessMessage message="SMS code has been sent to your phone." />
          )}
          {callGetCodeError ? (
            <ErrorMessage message={callGetCodeError} />
          ) : null}
        </Box>
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.verificationCode}
        isRequired={isFieldRequired(validationRules?.verificationCode)}
      >
        <FormLabel>Code</FormLabel>
        <Input
          placeholder="Received SMS code"
          value={inputs.verificationCode || ''}
          onChange={(e) => inputsUpdater('verificationCode', e.target.value)}
        />
        <FormErrorMessage>{inputsErrors?.verificationCode}</FormErrorMessage>
      </FormControl>
    </Box>
  );
}
SMSCodeControl.prototype.propTypes = {
  inputsErrors: unknownObjectValidator.isRequired,
  inputs: unknownObjectValidator.isRequired,
  inputsUpdater: PropTypes.func.isRequired,
  formState: PropTypes.string.isRequired,
  validationRules: unknownObjectValidator.isRequired,
};
