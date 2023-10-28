import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
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
import config from 'src/config';
import useCall from 'src/hooks/useCall';
import { unknownObjectValidator, isFieldRequired } from 'src/helpers';
import ProfessionalInfo from 'src/components/ProfessionalInfo';
import { InitialDataContext, UserIdContext } from 'src/providers';
import FormGroup from 'src/components/FormGroup';
import RatingFormControls from 'src/components/RatingFormControls';

const getSuccessMessage = (smsCode, smsPaymentPhone) =>
  `Thank you for your review! Please send the code "${smsCode}" to phone number ${smsPaymentPhone} to publish the review.`;

const getFormInfoMessage = (smsPaymentPhone) =>
  `Each review costs 0.5€. After submitting this form, you will receive a code. Please send the code to phone number ${smsPaymentPhone} via SMS.`;

export function CreateReviewForm({
  formResult,
  state,
  inputsErrors,
  getInput,
  updateInput,
  professional,
  validationRules,
}) {
  const { smsPaymentPhone } = useContext(InitialDataContext);
  const {
    userIdName,
    userId,
    setUserId,
    validationRules: userIdValidationRules,
    inputFormat: userIdInputFormat,
  } = useContext(UserIdContext);

  if (!professional) {
    return null;
  }

  return (
    <Box>
      <FormControl>
        <InfoMessage message={getFormInfoMessage(smsPaymentPhone)} />
      </FormControl>
      <FormGroup groupLabel="Reviewed person">
        <ProfessionalInfo data={professional} />
      </FormGroup>
      <FormGroup groupLabel="Review">
        <RatingFormControls
          getInput={getInput}
          inputsErrors={inputsErrors}
          updateInput={updateInput}
          validationRules={validationRules}
        />
      </FormGroup>
      <FormGroup>
        <FormControl isInvalid={inputsErrors && inputsErrors[userIdName]}>
          <FormLabel>Your phone</FormLabel>
          <Input
            isRequired={isFieldRequired(userIdValidationRules)}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder={userIdInputFormat}
          />
          <FormErrorMessage>
            {inputsErrors && inputsErrors[userIdName]}
          </FormErrorMessage>
        </FormControl>
      </FormGroup>
      {state.isError ? <ErrorMessage message={formResult.msg} /> : null}
      {state.isSuccess ? (
        <SuccessMessage
          message={getSuccessMessage(formResult?.data.smsCode, smsPaymentPhone)}
        />
      ) : null}
    </Box>
  );
}
CreateReviewForm.defaultProps = {
  professional: null,
  formResult: null,
};

CreateReviewForm.prototype.propTypes = {
  formResult: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  state: PropTypes.string.isRequired,
  inputsErrors: unknownObjectValidator.isRequired,
  getInput: PropTypes.func.isRequired,
  updateInput: PropTypes.func.isRequired,
  professional: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  validationRules: unknownObjectValidator.isRequired,
};

export function formConfigFactory(professional) {
  return {
    validationGroup: 'createReviewForExistingProfessionalRequest',
    hook: (onCallFinish) => {
      const call = useCall(onCallFinish);

      return (inputs) =>
        call(config.api.endPointsURLs.createReview, 'post', inputs);
    },
    formUI: CreateReviewForm,
    professional,
    inputsToRequestMapper: (inputs) => ({
      professionalId: parseInt(professional.id, 10),
      review: {
        text: inputs?.text || null,
        rating: inputs?.rating ? parseInt(inputs.rating, 10) : '',
      },
    }),
  };
}
