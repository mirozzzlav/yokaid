import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  FormLabel,
  FormControl,
  Box,
  FormErrorMessage,
  Textarea,
} from '@chakra-ui/react';
import {
  ErrorMessage,
  InfoMessage,
  SuccessMessage,
} from 'src/components/Messages';
import { isFieldRequired, unknownObjectValidator } from 'src/helpers';
import config from 'src/config';
import { InitialDataContext } from 'src/providers';
import useCall from '../hooks/useCall';

const successMessage = 'Your message has been sent to professional.';

const style = {
  message: {
    minHeight: '200px',
  },
};

export default function ContactProfessionalForm({
  errorMsg,
  state,
  inputsErrors,
  inputs,
  updateInputs,
  validationRules,
  extraData,
}) {
  const { inputFormats } = useContext(InitialDataContext);
  return (
    <Box>
      <FormControl
        isInvalid={inputsErrors?.userPhone}
        isRequired={isFieldRequired(validationRules?.userPhone)}
      >
        <FormControl>
          {extraData?.fullName ? (
            <InfoMessage
              message={`Once you send a message over this form, we will re-send it to ${extraData.fullName} via SMS.`}
            />
          ) : null}
        </FormControl>
        <FormLabel>Your Phone</FormLabel>
        <Input
          type="text"
          placeholder={inputFormats?.phone}
          value={inputs.userPhone}
          onChange={(e) => {
            updateInputs('userPhone', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.userPhone}</FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.message}
        isRequired={isFieldRequired(validationRules?.message)}
      >
        <FormLabel>Message</FormLabel>
        <Textarea
          sx={style.message}
          value={inputs.message}
          onChange={(e) => {
            updateInputs('message', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.message}</FormErrorMessage>
      </FormControl>

      {state.isError ? <ErrorMessage message={errorMsg} /> : null}
      {state.isSuccess ? <SuccessMessage message={successMessage} /> : null}
    </Box>
  );
}

ContactProfessionalForm.defaultProps = {
  extraData: null,
};

ContactProfessionalForm.prototype.propTypes = {
  errorMsg: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  inputsErrors: unknownObjectValidator.isRequired,
  inputs: unknownObjectValidator.isRequired,
  updateInputs: PropTypes.func.isRequired,
  validationRules: unknownObjectValidator.isRequired,
  extraData: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
};

export function formFactory(professional) {
  return {
    inputNames: ['userPhone', 'message'],
    hook: (onCallFinish) => {
      const call = useCall(onCallFinish);
      return (inputs) =>
        call(config.api.endPointsURLs.contactProfessional, 'post', inputs);
    },
    extraData: professional,
    formUI: ContactProfessionalForm,
    validationRulesNames: ['contactProfessionalRequest'],
    inputsToRequestMapper: (inputs) => ({
      ...inputs,
      professionalId: professional.id,
    }),
  };
}
