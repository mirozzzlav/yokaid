import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import { isFieldRequired, unknownObjectValidator } from 'src/helpers';
import Rating from 'src/components/Rating';
import PropTypes from 'prop-types';
import React from 'react';

const style = {
  reviewTextArea: {
    minHeight: '200px',
  },
};

export default function RatingFormControls({
  inputsErrors,
  getInput,
  updateInput,
  validationRules,
}) {
  return (
    <>
      <FormControl
        isInvalid={inputsErrors?.text}
        isRequired={isFieldRequired(validationRules?.text)}
      >
        <Textarea
          value={getInput('text')}
          sx={style.reviewTextArea}
          onChange={(e) => {
            updateInput('text', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.text}</FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.rating}
        isRequired={isFieldRequired(validationRules?.rating)}
      >
        <FormLabel>Rating</FormLabel>
        <Rating
          rating={getInput('rating')}
          onStarClick={(r) => updateInput('rating', r)}
          margin="0"
        />
        <FormErrorMessage>{inputsErrors?.rating}</FormErrorMessage>
      </FormControl>
    </>
  );
}
RatingFormControls.prototype.propTypes = {
  inputsErrors: unknownObjectValidator.isRequired,
  getInput: PropTypes.func.isRequired,
  updateInput: PropTypes.func.isRequired,
  validationRules: unknownObjectValidator.isRequired,
};
