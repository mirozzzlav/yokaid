import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { ErrorMessage, SuccessMessage } from 'src/components/Messages';
import { usePlacesSearch } from 'src/hooks';
import Rating from 'src/components/Rating';
import { SearchDropdown } from 'src/components/Dropdown';
import config from 'src/config';
import useCall from 'src/hooks/useCall';
import { unknownObjectValidator, isFieldRequired } from 'src/helpers';
import { MultiInput } from 'src/components/MultiItem';
import { globalStyle } from 'src/style';
import ProfessionalInfo from 'src/components/ProfessionalInfo';

function useProInfoSearch(onSearchFinish) {
  const call = useCall((response) => {
    onSearchFinish(
      response.data
        ? response.data.map((d) => ({
            label: `${d.fullName} - ${d.services
              .map(({ title }) => title)
              .join(', ')}`,
            value: d,
          }))
        : null,
    );
  });
  return useCallback(
    (professionalName) =>
      call(
        `${config.api.endPointsURLs.getProfessionalsInfo}/${professionalName}`,
      ),
    [call],
  );
}

function useServicesSearch(onSearchFinish) {
  const call = useCall((response) => {
    onSearchFinish(
      response.data
        ? response.data.map((d) => ({
            label: d.title,
            value: d,
          }))
        : null,
    );
  });

  return useCallback(
    (serviceTitle) =>
      call(`${config.api.endPointsURLs.getServices}/${serviceTitle}`),
    [call],
  );
}

const style = {
  reviewTextArea: {
    minHeight: '200px',
  },
};

const inputNames = [
  'fullName',
  'businessId',
  'locationLat',
  'locationLng',
  'location',
  'phone',
  'email',
  'searchedService',
  'services',
  'text',
  'rating',
  'professionalId',
];

const validationRulesNames = [
  'createProfessionalWithReviewRequest',
  'createReviewForExistingProfessionalRequest',
];

export function RatingFormControls({
  inputs,
  inputsErrors,
  updateInputs,
  validationRules,
}) {
  return (
    <>
      <FormControl
        isInvalid={inputsErrors?.text}
        isRequired={isFieldRequired(validationRules?.text)}
      >
        <FormLabel>Your Review</FormLabel>
        <Textarea
          value={inputs.text}
          sx={style.reviewTextArea}
          onChange={(e) => {
            updateInputs('text', e.target.value);
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
          rating={inputs.rating}
          onStarClick={(r) => updateInputs('rating', r)}
          margin="0"
        />
        <FormErrorMessage>{inputsErrors?.rating}</FormErrorMessage>
      </FormControl>
    </>
  );
}
RatingFormControls.prototype.propTypes = {
  inputsErrors: unknownObjectValidator.isRequired,
  inputs: unknownObjectValidator.isRequired,
  updateInputs: PropTypes.func.isRequired,
  validationRules: unknownObjectValidator.isRequired,
};

export default function CreateReviewForm({
  errorMsg,
  state,
  inputsErrors,
  inputs,
  updateInputs,
  extraData,
  validationRules,
}) {
  return (
    <Box sx={globalStyle.formWrapper}>
      <ProfessionalInfo data={extraData} />
      <RatingFormControls
        inputs={inputs}
        inputsErrors={inputsErrors}
        updateInputs={updateInputs}
        validationRules={validationRules}
      />
      {state.isError ? <ErrorMessage message={errorMsg} /> : null}
      {state.isSuccess ? (
        <SuccessMessage message="your review has been added" />
      ) : null}
    </Box>
  );
}
CreateReviewForm.defaultProps = {
  extraData: null,
};

CreateReviewForm.prototype.propTypes = {
  errorMsg: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  inputsErrors: unknownObjectValidator.isRequired,
  inputs: unknownObjectValidator.isRequired,
  updateInputs: PropTypes.func.isRequired,
  extraData: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  validationRules: unknownObjectValidator.isRequired,
};

export function CreateProAndReviewForm({
  errorMsg,
  state,
  inputsErrors,
  inputs,
  updateInputs,
  extraActions,
  validationRules,
}) {
  const [serviceTitles, setServiceTitles] = useState(null);
  return (
    <Box sx={globalStyle.formWrapper}>
      <FormControl
        isInvalid={inputsErrors?.fullName}
        isRequired={isFieldRequired(validationRules?.fullName)}
      >
        <FormLabel>Reviewed person</FormLabel>
        <SearchDropdown
          searchHook={useProInfoSearch}
          inputVal={inputs.fullName}
          inputValSetter={(v) => updateInputs('fullName', v)}
          onValueSet={({ value }) => {
            if (extraActions.onProfessionalFound) {
              extraActions.onProfessionalFound(value);
            }
          }}
          onValueEmpty={() => {
            updateInputs('fullName', '');
          }}
          position="left"
          width="100%"
        />
        <FormErrorMessage>{inputsErrors?.fullName}</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={
          inputsErrors?.locationLat ||
          inputsErrors?.locationLng ||
          inputsErrors?.location
        }
        isRequired={isFieldRequired(validationRules?.location)}
      >
        <FormLabel>Location</FormLabel>
        <SearchDropdown
          inputVal={inputs.location}
          inputValSetter={(v) => updateInputs('location', v)}
          searchHook={usePlacesSearch}
          onValueSet={({ value: [lat, lng], label }) => {
            updateInputs('locationLat', parseFloat(lat));
            updateInputs('locationLng', parseFloat(lng));
            updateInputs('location', label);
          }}
          onValueEmpty={() => {
            updateInputs('locationLat', '');
            updateInputs('locationLng', '');
            updateInputs('location', '');
          }}
          position="left"
          width="100%"
        />
        <FormErrorMessage>
          {inputsErrors?.location ||
            inputsErrors?.locationLat ||
            inputsErrors?.locationLng}
        </FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.businessId}
        isRequired={isFieldRequired(validationRules?.businessId)}
      >
        <FormLabel>Business Id</FormLabel>
        <Input
          type="text"
          value={inputs.businessId}
          onChange={(e) => {
            updateInputs('businessId', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.businessId}</FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.phone}
        isRequired={isFieldRequired(validationRules?.phone)}
      >
        <FormLabel>Phone</FormLabel>
        <Input
          type="text"
          value={inputs.phone}
          onChange={(e) => {
            updateInputs('phone', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.phone}</FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.email}
        isRequired={isFieldRequired(validationRules?.phone)}
      >
        <FormLabel>Email</FormLabel>
        <Input
          type="text"
          value={inputs.email}
          onChange={(e) => {
            updateInputs('email', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.email}</FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.services}
        isRequired={isFieldRequired(validationRules?.services)}
      >
        <FormLabel>Services</FormLabel>
        <SearchDropdown
          inputVal={inputs.searchedService}
          inputValSetter={(v) => updateInputs('searchedService', v)}
          searchHook={useServicesSearch}
          onValueSet={({ value }) => {
            if (updateInputs('services', value.id, true)) {
              setServiceTitles((prevTitles) =>
                prevTitles ? [...prevTitles, value.title] : [value.title],
              );
            }
          }}
          showCloseIcon={false}
          position="left"
          width="100%"
        />
        <MultiInput
          values={inputs.services ? inputs.services.split(',') : null}
          labels={serviceTitles}
          onItemRemove={(services, titles) => {
            updateInputs('services', services ? services.join(',') : '');
            setServiceTitles(titles || null);
          }}
        />
        <FormErrorMessage>{inputsErrors?.services}</FormErrorMessage>
      </FormControl>

      <RatingFormControls
        inputs={inputs}
        inputsErrors={inputsErrors}
        updateInputs={updateInputs}
        validationRules={validationRules}
      />

      {state.isError ? <ErrorMessage message={errorMsg} /> : null}
      {state.isSuccess ? (
        <SuccessMessage message="your review has been noticed, after admin approval it will be publicly visible" />
      ) : null}
    </Box>
  );
}

CreateProAndReviewForm.defaultProps = {
  extraActions: null,
};

CreateProAndReviewForm.prototype.propTypes = {
  errorMsg: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  inputsErrors: unknownObjectValidator.isRequired,
  inputs: unknownObjectValidator.isRequired,
  updateInputs: PropTypes.func.isRequired,
  extraActions: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  validationRules: unknownObjectValidator.isRequired,
};

export function formFactory(extraData, extraActions) {
  if (extraData) {
    return {
      inputNames,
      validationRulesNames,
      hook: (onCallFinish) => {
        const call = useCall(onCallFinish);

        return (inputs) =>
          call(config.api.endPointsURLs.createReview, 'post', inputs);
      },
      formUI: CreateReviewForm,
      extraData,
      inputsToRequestMapper: (inputs) => {
        const { text, rating } = inputs;
        return {
          professionalId: parseInt(extraData.id, 10),
          review: {
            text: text || null,
            rating: parseInt(rating, 10),
          },
        };
      },
    };
  }

  return {
    inputNames,
    validationRulesNames,
    hook: (onCallFinish) => {
      const call = useCall(onCallFinish);

      return (inputs) =>
        call(
          config.api.endPointsURLs.createProfessionalWithReview,
          'post',
          inputs,
        );
    },
    formUI: CreateProAndReviewForm,
    extraActions,
    inputsToRequestMapper: ({
      text,
      rating,
      services,
      locationLng,
      locationLat,
      location,
      businessId,
      fullName,
      email,
      phone,
    }) => ({
      professional: {
        location,
        businessId: businessId || null,
        fullName,
        email: email || null,
        phone: phone || null,
        locationLat: parseFloat(locationLat),
        locationLng: parseFloat(locationLng),
      },
      services: services
        ? services.split(',').map((s) => parseInt(s, 10))
        : null,
      review: {
        text: text || null,
        rating: parseInt(rating, 10),
      },
    }),
  };
}
