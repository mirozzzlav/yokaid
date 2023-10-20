import React, { useCallback, useContext, useMemo, useState } from 'react';
import { InitialDataContext, UserIdContext } from 'src/providers';
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
} from '@chakra-ui/react';
import {
  ErrorMessage,
  InfoMessage,
  SuccessMessage,
} from 'src/components/Messages';
import FormGroup from 'src/components/FormGroup';
import { isFieldRequired, unknownObjectValidator } from 'src/helpers';
import { SearchDropdown } from 'src/components/Dropdown';
import { useSearchProfessional, usePlacesSearch } from 'src/hooks';
import Icons from 'src/components/Icons';
import { MultiInput } from 'src/components/MultiItem';
import PropTypes from 'prop-types';
import RatingFormControls from 'src/components/RatingFormControls';
import useCall from 'src/hooks/useCall';
import config from 'src/config';

function useProfessionsSearch(onSearchFinish) {
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
    (professionTitle) =>
      call(`${config.api.endPointsURLs.getProfessions}/${professionTitle}`),
    [call],
  );
}

const getSuccessMessage = (smsCode, smsPaymentPhone) =>
  `Thank you for your review! Please send the code "${smsCode}" to phone number ${smsPaymentPhone} to publish the review.`;

const getFormInfoMessage = (smsPaymentPhone) =>
  `Each review costs 0.5€. After submitting this form, you will receive a code. Please send the code to phone number ${smsPaymentPhone} via SMS.`;

export function CreateReviewWithPro({
  errorMsg,
  successData,
  state,
  inputsErrors,
  inputs,
  updateInputs,
  onProfessionalFound,
  validationRules,
}) {
  const [professionTitles, setProfessionTitles] = useState(null);
  const [searchedProfession, setSearchedProfession] = useState('');
  const {
    userIdName,
    setUserId,
    userId,
    validationRules: userIdValidationRules,
    inputFormat: userIdInputFormat,
  } = useContext(UserIdContext);
  const { filters, inputFormats, smsPaymentPhone } =
    useContext(InitialDataContext);
  const initialProfessions = useMemo(
    () =>
      filters?.profession
        ? filters.profession.map(({ label, value }) => ({
            label,
            value: {
              id: value,
              title: label,
            },
          }))
        : null,
    [filters],
  );

  return (
    <Box>
      <FormControl>
        <InfoMessage message={getFormInfoMessage(smsPaymentPhone)} />
      </FormControl>
      <FormGroup groupLabel="Reviewed person">
        <FormControl
          isInvalid={inputsErrors?.fullName}
          isRequired={isFieldRequired(validationRules?.fullName)}
        >
          <FormLabel>Full name</FormLabel>
          <SearchDropdown
            searchHook={useSearchProfessional}
            inputVal={inputs.fullName}
            inputValSetter={(v) => updateInputs('fullName', v)}
            onValueSet={({ value }) =>
              onProfessionalFound && onProfessionalFound(value)
            }
            onValueEmpty={() => {
              updateInputs('fullName', '');
            }}
            position="left"
            dropdownWidth="100%"
            placeholder={inputFormats?.fullName}
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
            dropdownWidth="100%"
            icon={<Icons.LocationIcon />}
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
          <InputGroup>
            <Input
              type="text"
              value={inputs.businessId}
              onChange={(e) => {
                updateInputs('businessId', e.target.value);
              }}
            />
          </InputGroup>
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
            placeholder={inputFormats?.phone}
          />
          <FormErrorMessage>{inputsErrors?.phone}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={inputsErrors?.email}
          isRequired={isFieldRequired(validationRules?.email)}
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
          isInvalid={inputsErrors?.professions}
          isRequired={isFieldRequired(validationRules?.professions)}
        >
          <FormLabel>Professions</FormLabel>
          <SearchDropdown
            inputVal={searchedProfession}
            inputValSetter={(v) => setSearchedProfession(v)}
            initialItems={initialProfessions}
            searchHook={useProfessionsSearch}
            onValueSet={({ value }) => {
              if (updateInputs('professions', value.id, true)) {
                setProfessionTitles((prevTitles) =>
                  prevTitles ? [...prevTitles, value.title] : [value.title],
                );
              }
            }}
            setInputValOnValSet={false}
            showCloseIcon={false}
            position="left"
            dropdownWidth="100%"
            icon={<Icons.WorkerIcon />}
          />
          <MultiInput
            values={inputs.professions ? inputs.professions.split(',') : null}
            labels={professionTitles}
            onItemRemove={(professions, titles) => {
              updateInputs(
                'professions',
                professions ? professions.join(',') : '',
              );
              setProfessionTitles(titles || null);
            }}
          />
          <FormErrorMessage>{inputsErrors?.professions}</FormErrorMessage>
        </FormControl>
      </FormGroup>
      <FormGroup groupLabel="Review">
        <RatingFormControls
          inputs={inputs}
          inputsErrors={inputsErrors}
          updateInputs={updateInputs}
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

      {state.isError ? <ErrorMessage message={errorMsg} /> : null}
      {state.isSuccess ? (
        <SuccessMessage
          message={getSuccessMessage(successData.smsCode, smsPaymentPhone)}
        />
      ) : null}
    </Box>
  );
}

CreateReviewWithPro.defaultProps = {
  successData: null,
};

CreateReviewWithPro.prototype.propTypes = {
  errorMsg: PropTypes.string.isRequired,
  successData: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  state: PropTypes.string.isRequired,
  inputsErrors: unknownObjectValidator.isRequired,
  inputs: unknownObjectValidator.isRequired,
  updateInputs: PropTypes.func.isRequired,
  onProfessionalFound: PropTypes.func.isRequired,
  validationRules: unknownObjectValidator.isRequired,
};

export function formConfigFactory(onProfessionalFound) {
  return {
    inputNames: [
      'fullName',
      'businessId',
      'locationLat',
      'locationLng',
      'location',
      'phone',
      'email',
      'professions',
      'text',
      'rating',
    ],
    validationGroup: 'createReviewAndProfessionalRequest',
    hook: (onCallFinish) => {
      const call = useCall(onCallFinish);

      return (inputs) =>
        call(
          config.api.endPointsURLs.createProfessionalWithReview,
          'post',
          inputs,
        );
    },
    formUI: CreateReviewWithPro,
    onProfessionalFound,
    inputsToRequestMapper: ({
      text,
      rating,
      professions,
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
      professions: professions
        ? professions.split(',').map((s) => parseInt(s, 10))
        : null,
      review: {
        text: text || null,
        rating: parseInt(rating, 10),
      },
    }),
  };
}
