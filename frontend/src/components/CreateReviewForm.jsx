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
import { unknownObjectValidator } from 'src/helpers';
import MultiInput from 'src/components/MultiInput';
import { globalStyle } from 'src/style';
import ProfessionalInfo from 'src/components/ProfessionalInfo';

function useProInfoSearch(onSearchFinish) {
  const call = useCall((response) => {
    onSearchFinish(
      response.data
        ? response.data.map((d) => ({
            label: d.fullName,
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

export function RatingFormControls({ inputs, inputsErrors, updateInputs }) {
  return (
    <>
      <FormControl isInvalid={inputsErrors?.text}>
        <FormLabel>Review</FormLabel>
        <Textarea
          value={inputs.text}
          sx={style.reviewTextArea}
          onChange={(e) => {
            updateInputs('text', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.text}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={inputsErrors?.rating}>
        <Rating
          rating={inputs.rating}
          onStarClick={(r) => updateInputs('rating', r)}
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
};

export default function CreateReviewForm({
  errorMsg,
  state,
  inputsErrors,
  inputs,
  updateInputs,
  extraData,
}) {
  return (
    <Box sx={globalStyle.formWrapper}>
      <ProfessionalInfo data={extraData} />
      <RatingFormControls
        inputs={inputs}
        inputsErrors={inputsErrors}
        updateInputs={updateInputs}
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
};

export function CreateProAndReviewForm({
  errorMsg,
  state,
  inputsErrors,
  inputs,
  updateInputs,
  extraActions,
}) {
  const [serviceTitles, setServiceTitles] = useState('');
  return (
    <Box sx={globalStyle.formWrapper}>
      <FormControl isInvalid={inputsErrors?.fullName}>
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
        />
        <FormErrorMessage>{inputsErrors?.fullName}</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={
          inputsErrors?.locationLat ||
          inputsErrors?.locationLng ||
          inputsErrors?.location
        }
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
        />
        <FormErrorMessage>
          {inputsErrors?.location ||
            inputsErrors?.locationLat ||
            inputsErrors?.locationLng}
        </FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={inputsErrors?.businessId}>
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
      <FormControl isInvalid={inputsErrors?.phone}>
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
      <FormControl isInvalid={inputsErrors?.email}>
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
      <FormControl isInvalid={inputsErrors?.services}>
        <FormLabel>Services</FormLabel>
        <SearchDropdown
          inputVal={inputs.searchedService}
          inputValSetter={(v) => updateInputs('searchedService', v)}
          searchHook={useServicesSearch}
          onValueSet={({ value }) => {
            if (updateInputs('services', value.id, true)) {
              setServiceTitles((prevTitles) =>
                prevTitles ? `${prevTitles},${value.title}` : value.title,
              );
            }
          }}
          showCloseIcon={false}
          position="left"
        />
        <MultiInput
          values={inputs.services}
          labels={serviceTitles}
          onItemRemove={(services, titles) => {
            updateInputs('services', services);
            setServiceTitles(titles);
          }}
        />
        <FormErrorMessage>{inputsErrors?.services}</FormErrorMessage>
      </FormControl>

      <RatingFormControls
        inputs={inputs}
        inputsErrors={inputsErrors}
        updateInputs={updateInputs}
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
};

export function formFactory(extraData, extraActions) {
  if (extraData) {
    return {
      inputNames,
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
    inputsToRequestMapper: (inputs) => {
      const {
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
      } = inputs;
      return {
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
      };
    },
  };
}
