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
  formResult,
  state,
  inputsErrors,
  inputs,
  getInput,
  updateInput,
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
            inputVal={getInput('fullName')}
            inputValSetter={(v) => updateInput('fullName', v)}
            onValueSet={({ value }) =>
              onProfessionalFound && onProfessionalFound(value)
            }
            onValueEmpty={() => {
              updateInput('fullName', '');
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
            inputVal={getInput('location')}
            inputValSetter={(v) => updateInput('location', v)}
            searchHook={usePlacesSearch}
            onValueSet={({ value: [lat, lng], label }) => {
              updateInput('locationLat', parseFloat(lat));
              updateInput('locationLng', parseFloat(lng));
              updateInput('location', label);
            }}
            onValueEmpty={() => {
              updateInput('locationLat', '');
              updateInput('locationLng', '');
              updateInput('location', '');
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
              value={getInput('businessId')}
              onChange={(e) => {
                updateInput('businessId', e.target.value);
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
            value={getInput('phone')}
            onChange={(e) => {
              updateInput('phone', e.target.value);
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
            value={getInput('email')}
            onChange={(e) => {
              updateInput('email', e.target.value);
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
              if (updateInput('professions', value.id, true)) {
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
            values={getInput('professions', true)}
            labels={professionTitles}
            onItemRemove={(professions, titles) => {
              updateInput(
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
          updateInput={updateInput}
          validationRules={validationRules}
          getInput={getInput}
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
          message={getSuccessMessage(formResult.data.smsCode, smsPaymentPhone)}
        />
      ) : null}
    </Box>
  );
}

CreateReviewWithPro.defaultProps = {
  formResult: null,
};

CreateReviewWithPro.prototype.propTypes = {
  formResult: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  state: PropTypes.string.isRequired,
  inputsErrors: unknownObjectValidator.isRequired,
  inputs: unknownObjectValidator.isRequired,
  getInput: PropTypes.func.isRequired,
  updateInput: PropTypes.func.isRequired,
  onProfessionalFound: PropTypes.func.isRequired,
  validationRules: unknownObjectValidator.isRequired,
};

export function formConfigFactory(onProfessionalFound) {
  return {
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
    inputsToRequestMapper: (inputs) => ({
      professional: {
        location: inputs?.location || '',
        businessId: inputs?.businessId || null,
        fullName: inputs?.fullName || '',
        email: inputs?.email || null,
        phone: inputs?.phone || null,
        locationLat: inputs?.locationLat ? parseFloat(inputs.locationLat) : '',
        locationLng: inputs?.locationLng ? parseFloat(inputs.locationLng) : '',
      },
      professions: inputs?.professions
        ? inputs.professions.split(',').map((s) => parseInt(s, 10))
        : null,
      review: {
        text: inputs?.text || null,
        rating: inputs?.rating ? parseInt(inputs.rating, 10) : '',
      },
    }),
  };
}
