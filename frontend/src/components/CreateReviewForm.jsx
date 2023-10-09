import React, { useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
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
import {
  unknownObjectValidator,
  isFieldRequired,
  verificationFormFactory,
} from 'src/helpers';
import { MultiInput } from 'src/components/MultiItem';
import ProfessionalInfo from 'src/components/ProfessionalInfo';
import Icons from 'src/components/Icons';
import SMSCodeControl from 'src/components/SMSCodeControl';
import { InitialDataContext } from 'src/providers';

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

const inputNames = [
  'fullName',
  'businessId',
  'locationLat',
  'locationLng',
  'location',
  'phone',
  'email',
  'searchedProfession',
  'professions',
  'text',
  'rating',
  'professionalId',
];

const validationRulesNames = [
  'createProfessionalWithReviewRequest',
  'createReviewForExistingProfessionalRequest',
];

const codeControlText = `Please provide your phone number for SMS verification code delivery. 
Once you receive the code, use it to confirm your review. You can do this at the bottom of this popup. 
The cost of the SMS is 0.5€.`;

export function CreateProAndReviewForm({
  errorMsg,
  state,
  inputsErrors,
  inputs,
  updateInputs,
  extraActions,
  validationRules,
}) {
  const [professionTitles, setProfessionTitles] = useState(null);

  const {
    filter: { profession: filterProfession },
  } = useContext(InitialDataContext);

  const initialProfessions = useMemo(
    () =>
      filterProfession
        ? filterProfession.map(({ label, value }) => ({
            label,
            value: {
              id: value,
              title: label,
            },
          }))
        : null,
    [filterProfession],
  );

  return (
    <Box>
      <FormControl>
        <InfoMessage message={codeControlText} />
      </FormControl>
      <FormControl
        isInvalid={inputsErrors?.fullName}
        isRequired={isFieldRequired(validationRules?.fullName)}
      >
        <FormLabel>Reviewed person</FormLabel>
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
          inputVal={inputs.searchedProfession}
          inputValSetter={(v) => updateInputs('searchedProfession', v)}
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

      <RatingFormControls
        inputs={inputs}
        inputsErrors={inputsErrors}
        updateInputs={updateInputs}
        validationRules={validationRules}
      />
      <SMSCodeControl
        inputsErrors={inputsErrors}
        inputs={inputs}
        inputsUpdater={updateInputs}
        formState={state}
        validationRules={validationRules}
      />

      {state.isError ? <ErrorMessage message={errorMsg} /> : null}
      {state.isSuccess ? (
        <SuccessMessage message="Thank you for your review! Once it's approved by our team, it will be visible to everyone." />
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

export function RatingFormControls({
  inputs,
  inputsErrors,
  updateInputs,
  validationRules,
}) {
  return (
    <>
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
    <Box>
      <FormControl>
        <InfoMessage message={codeControlText} />
      </FormControl>
      <ProfessionalInfo data={extraData} />
      <RatingFormControls
        inputs={inputs}
        inputsErrors={inputsErrors}
        updateInputs={updateInputs}
        validationRules={validationRules}
      />
      <SMSCodeControl
        inputsErrors={inputsErrors}
        inputs={inputs}
        inputsUpdater={updateInputs}
        formState={state}
        validationRules={validationRules}
      />
      {state.isError ? <ErrorMessage message={errorMsg} /> : null}
      {state.isSuccess ? (
        <SuccessMessage message="Your review has been successfully posted." />
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

export function formFactory(extraData, extraActions) {
  let formObject = {
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

  if (extraData) {
    formObject = {
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
  return verificationFormFactory(formObject);
}
