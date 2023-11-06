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
import { unknownObjectValidator } from 'src/helpers';
import ProfessionalInfo from 'src/components/ProfessionalInfo';
import {
  InitialDataContext,
  TranslationsContext,
  UserIdFormControl,
} from 'src/providers';
import FormGroup from 'src/components/FormGroup';
import RatingFormControls from 'src/components/RatingFormControls';

export function CreateReviewForm({
  formResult,
  state,
  inputsErrors,
  getInput,
  updateInput,
  professional,
  validationRules,
}) {
  const { T } = useContext(TranslationsContext);
  const { smsPaymentPhone } = useContext(InitialDataContext);

  if (!professional) {
    return null;
  }

  return (
    <Box>
      <FormControl>
        <InfoMessage message={T('review form info', [smsPaymentPhone])} />
      </FormControl>
      <FormGroup groupLabel={T('reviewed person')}>
        <ProfessionalInfo data={professional} />
      </FormGroup>
      <FormGroup groupLabel={T('review')}>
        <RatingFormControls
          getInput={getInput}
          inputsErrors={inputsErrors}
          updateInput={updateInput}
          validationRules={validationRules}
        />
      </FormGroup>
      <FormGroup>
        <UserIdFormControl error={inputsErrors?.[config.userIdMeta.name]} />
      </FormGroup>
      {state.isError ? <ErrorMessage message={T(formResult.msg)} /> : null}
      {state.isSuccess ? (
        <SuccessMessage
          message={T(formResult.msg, [
            formResult?.data.smsCode,
            smsPaymentPhone,
          ])}
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
      const { callPost } = useCall(onCallFinish);

      return (inputs) =>
        callPost(config.api.endPointsURLs.createReview, inputs);
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
