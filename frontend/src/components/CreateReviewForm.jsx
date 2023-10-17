import React, { useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  Textarea,
} from '@chakra-ui/react';
import {
  ErrorMessage,
  InfoMessage,
  SuccessMessage,
} from 'src/components/Messages';
import { useSearchProfessional } from 'src/hooks/useProfessionals';
import usePlacesSearch from 'src/hooks/usePlacesSearch';
import Rating from 'src/components/Rating';
import { SearchDropdown } from 'src/components/Dropdown';
import config from 'src/config';
import useCall from 'src/hooks/useCall';
import { unknownObjectValidator, isFieldRequired } from 'src/helpers';
import { MultiInput } from 'src/components/MultiItem';
import ProfessionalInfo from 'src/components/ProfessionalInfo';
import Icons from 'src/components/Icons';
import { InitialDataContext } from 'src/providers';
import theme from 'src/style';
import FormGroup from 'src/components/FormGroup';

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

const style = {
  reviewTextArea: {
    minHeight: '200px',
  },
};

const validationRulesNames = [
  'createReviewAndProfessionalRequest',
  'createReviewForExistingProfessionalRequest',
];

const getSuccessMessage = (smsCode, smsPaymentPhone) =>
  `Thank you for your review! Please send the code "${smsCode}" to phone number ${smsPaymentPhone} to publish the review.`;

const getFormInfoMessage = (smsPaymentPhone) =>
  `Each review costs 0.5€. After submitting this form, you will receive a code. Please send the code to phone number ${smsPaymentPhone} via SMS.`;

export function CreateProAndReviewForm({
  errorMsg,
  successData,
  state,
  inputsErrors,
  inputs,
  updateInputs,
  extraActions,
  validationRules,
}) {
  const [professionTitles, setProfessionTitles] = useState(null);
  const [searchedProfession, setSearchedProfession] = useState('');
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
            onValueSet={({ value }) => {
              if (extraActions.onProfessionalFound) {
                extraActions.onProfessionalFound(value);
              }
            }}
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
        <FormControl
          isInvalid={inputsErrors && inputsErrors[config.userIdName]}
        >
          <FormLabel>Your phone</FormLabel>
          <Input
            isRequired={isFieldRequired(
              validationRules && validationRules[config.userIdName],
            )}
            value={inputs[config.userIdName]}
            onChange={(e) => updateInputs('userPhone', e.target.value)}
            placeholder={inputFormats?.phone}
          />
          <FormErrorMessage>
            {inputsErrors && inputsErrors[config.userIdName]}
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

CreateProAndReviewForm.defaultProps = {
  extraActions: null,
  successData: null,
};

CreateProAndReviewForm.prototype.propTypes = {
  errorMsg: PropTypes.string.isRequired,
  successData: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
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
  successData,
  state,
  inputsErrors,
  inputs,
  updateInputs,
  extraData,
  validationRules,
}) {
  const { smsPaymentPhone, inputFormats } = useContext(InitialDataContext);

  return (
    <Box>
      <FormControl>
        <InfoMessage message={getFormInfoMessage(smsPaymentPhone)} />
      </FormControl>
      <FormGroup groupLabel="Reviewed person">
        <ProfessionalInfo data={extraData} />
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
        <FormControl
          isInvalid={inputsErrors && inputsErrors[config.userIdName]}
        >
          <FormLabel>Your phone</FormLabel>
          <Input
            isRequired={isFieldRequired(
              validationRules && validationRules[config.userIdName],
            )}
            value={inputs[config.userIdName]}
            onChange={(e) => updateInputs('userPhone', e.target.value)}
            placeholder={inputFormats?.phone}
          />
          <FormErrorMessage>
            {inputsErrors && inputsErrors[config.userIdName]}
          </FormErrorMessage>
        </FormControl>
      </FormGroup>
      {state.isError ? <ErrorMessage message={errorMsg} /> : null}
      {state.isSuccess ? (
        <SuccessMessage
          message={getSuccessMessage(successData?.smsCode, smsPaymentPhone)}
        />
      ) : null}
    </Box>
  );
}
CreateReviewForm.defaultProps = {
  extraData: null,
  successData: null,
};

CreateReviewForm.prototype.propTypes = {
  errorMsg: PropTypes.string.isRequired,
  successData: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
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

export function formFactory(extraData, extraActions) {
  const inputNames = [
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
    'professionalId',
  ];

  let formObject = {
    inputNames,
    localStorageInputNames: [config.userIdName],
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
      professions,
      locationLng,
      locationLat,
      location,
      businessId,
      fullName,
      email,
      phone,
      ...restInputs
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
      [config.userIdName]: restInputs[config.userIdName],
    }),
  };

  if (extraData) {
    formObject = {
      inputNames,
      localStorageInputNames: [config.userIdName],
      validationRulesNames,
      hook: (onCallFinish) => {
        const call = useCall(onCallFinish);

        return (inputs) =>
          call(config.api.endPointsURLs.createReview, 'post', inputs);
      },
      formUI: CreateReviewForm,
      extraData,
      inputsToRequestMapper: ({ text, rating, ...restInputs }) => ({
        professionalId: parseInt(extraData.id, 10),
        review: {
          text: text || null,
          rating: parseInt(rating, 10),
        },
        [config.userIdName]: restInputs[config.userIdName],
      }),
    };
  }
  return formObject;
}
