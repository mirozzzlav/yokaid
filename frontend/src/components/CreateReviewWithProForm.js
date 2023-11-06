import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  InitialDataContext,
  TranslationsContext,
  UserIdFormControl,
} from 'src/providers';
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
  const { call } = useCall((response) => {
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
      call(config.api.endPointsURLs.getProfessions, [professionTitle]),
    [call],
  );
}

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

  const { T } = useContext(TranslationsContext);

  return (
    <Box>
      <FormControl>
        <InfoMessage message={T('review form info', [smsPaymentPhone])} />
      </FormControl>
      <FormGroup groupLabel={T('reviewed person')}>
        <FormControl
          isInvalid={inputsErrors?.fullName}
          isRequired={isFieldRequired(validationRules?.fullName)}
        >
          <FormLabel>{T('full name')}</FormLabel>
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
            placeholder={T(inputFormats?.fullName)}
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
          <FormLabel>{T('location')}</FormLabel>
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
          <FormLabel>{T('business id')}</FormLabel>
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
          <FormLabel>{T('phone')}</FormLabel>
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
          <FormLabel>{T('profession', [], 2)}</FormLabel>
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
      <FormGroup groupLabel={T('review')}>
        <RatingFormControls
          inputs={inputs}
          inputsErrors={inputsErrors}
          updateInput={updateInput}
          validationRules={validationRules}
          getInput={getInput}
        />
      </FormGroup>
      <FormGroup>
        <UserIdFormControl error={inputsErrors?.[config.userIdMeta.name]} />
      </FormGroup>

      {state.isError ? <ErrorMessage message={T(formResult.msg)} /> : null}
      {state.isSuccess ? (
        <SuccessMessage
          message={T(formResult.msg, [
            formResult.data.smsCode,
            smsPaymentPhone,
          ])}
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
      const { callPost } = useCall(onCallFinish);

      return (inputs) =>
        callPost(config.api.endPointsURLs.createProfessionalWithReview, inputs);
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
