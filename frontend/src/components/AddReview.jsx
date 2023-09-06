import React, { useCallback } from 'react';
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
import { useForm, usePlacesSearch } from 'src/hooks';
import { Rating, SearchDropdown } from 'src/components/index';
import useCall from '../hooks/useCall';
import config from 'src/config';
import { objToSnakeCase } from 'src/helpers';

function useAddReviewCall(onCallFinish) {
  const call = useCall(onCallFinish);

  return useCallback((inputs) => {
    call(
      config.api.endPointsURLs.addProfessionalWithReview,
      'post',
      objToSnakeCase(inputs),
    );
  }, []);
}

function useProInfoSearch(onSearchFinish) {
  const call = useCall((response) => {
    onSearchFinish(
      response.data
        ? response.data.map(({ fullName, ...restData }) => ({
            label: fullName,
            value: restData,
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

const successMessage =
  'your review has been added, after admin approval it will be publicly visible';

const style = {
  reviewTextArea: {
    minHeight: '200px',
  },
};

export default function AddReviewForm({
  isShown,
  setIsShown,
  isSubmitted,
  setIsSubmitted,
}) {
  const { isError, errorMsg, isSuccess, inputsErrors, inputs, updateInputs } =
    useForm(
      isShown,
      setIsShown,
      isSubmitted,
      setIsSubmitted,
      useAddReviewCall,
      [
        'fullName',
        'businessId',
        'locationLat',
        'locationLng',
        'location',
        'phone',
        'email',
        'text',
        'rating',
      ],
      false,
    );

  return (
    <Box>
      <FormControl isInvalid={inputsErrors?.fullName} mb="10px">
        <FormLabel mb={0}>Reviewed person</FormLabel>
        <SearchDropdown
          searchHook={useProInfoSearch}
          value={inputs.fullName}
          onValueSet={({ value }) => {
            const {
              fullName,
              businessId,
              phone,
              email,
              location,
              locationLat,
              locationLng,
            } = value;

            updateInputs('fullName', fullName);
            updateInputs('businessId', businessId);
            updateInputs('phone', phone);
            updateInputs('email', email);
            updateInputs('locationLat', locationLat);
            updateInputs('locationLng', locationLng);
            updateInputs('location', location);
          }}
          onValueEmpty={() => {
            updateInputs('fullName', '');
          }}
          onInputValChange={(v) => updateInputs('fullName', v)}
          position="left"
        />
        <FormErrorMessage>{inputsErrors?.fullName}</FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.locationLat || inputsErrors?.locationLng}
        mb="10px"
      >
        <FormLabel mb={0}>Location</FormLabel>
        <SearchDropdown
          inputVal={inputs.location}
          searchHook={usePlacesSearch}
          onValueSet={({ value: [lat, lng], label }) => {
            updateInputs('locationLat', lat);
            updateInputs('locationLng', lng);
            updateInputs('location', label);
          }}
          onValueEmpty={() => {
            updateInputs('locationLat', '');
            updateInputs('locationLng', '');
            updateInputs('location', '');
          }}
          position="left"
        />
        <FormErrorMessage>{inputsErrors?.location}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={inputsErrors?.businessId} mb="10px">
        <FormLabel mb={0}>Business Id</FormLabel>
        <Input
          type="text"
          value={inputs.businessId}
          onChange={(e) => {
            updateInputs('businessId', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.businessId}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={inputsErrors?.phone} mb="10px">
        <FormLabel mb={0}>Phone</FormLabel>
        <Input
          type="text"
          value={inputs.phone}
          onChange={(e) => {
            updateInputs('phone', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.email}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={inputsErrors?.email} mb="10px">
        <FormLabel mb={0}>Email</FormLabel>
        <Input
          type="text"
          value={inputs.email}
          onChange={(e) => {
            updateInputs('email', e.target.value);
          }}
        />
        <FormErrorMessage>{inputsErrors?.email}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={inputsErrors?.text} mb="15px">
        <FormLabel mb={0}>Review</FormLabel>
        <Textarea
          value={inputs.text}
          sx={style.reviewTextArea}
          onChange={(e) => {
            updateInputs('text', e.target.value);
          }}
        />
        <Rating
          rating={inputs.rating}
          onStarClick={(r) => updateInputs('rating', r)}
        />
        <FormErrorMessage>{inputsErrors?.rating}</FormErrorMessage>
      </FormControl>

      {isError() ? <ErrorMessage message={errorMsg} /> : null}
      {isSuccess() ? <SuccessMessage message={successMessage} /> : null}
    </Box>
  );
}

AddReviewForm.propTypes = {
  isShown: PropTypes.bool.isRequired,
  setIsShown: PropTypes.func.isRequired,
  isSubmitted: PropTypes.bool.isRequired,
  setIsSubmitted: PropTypes.func.isRequired,
};
