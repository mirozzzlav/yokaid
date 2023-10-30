import { Button, FormControl } from '@chakra-ui/react';
import {
  ErrorMessage,
  InfoMessage,
  SuccessMessage,
} from 'src/components/Messages';
import FormGroup from 'src/components/FormGroup';
import React, { useContext, useState } from 'react';
import config from 'src/config';
import useCall from 'src/hooks/useCall';
import PropTypes from 'prop-types';
import {
  InitialDataContext,
  UserIdContext,
  UserIdFormControl,
} from 'src/providers';
import MultiItem from 'src/components/MultiItem';
import theme from 'src/style';
import { getStringFirstCaps } from 'src/helpers';

export default function ProfessionalContact({
  professionalId,
  contact,
  onContactPaid,
}) {
  const { userId, saveUserId, getUserIdError } = useContext(UserIdContext);

  const [code, setCode] = useState('');
  const { smsPaymentPhone } = useContext(InitialDataContext);
  const [error, setError] = useState('');

  const call = useCall((response, success) => {
    if (!success) {
      setError(
        `${getStringFirstCaps(
          getUserIdError(response.data) || response.msg || 'Unknown error',
        )}.`,
      );
      setCode('');
      return;
    }

    if (response.data.contact) {
      onContactPaid((prevState) => ({
        ...prevState,
        contact: response.data.contact,
      }));
    }

    setError('');
    saveUserId();
    if (response.data.code) {
      setCode(response.data.code);
    }
  });

  if (contact) {
    return (
      <MultiItem
        margin={`${theme.space[1]} 0`}
        labels={[contact.phone, ...(contact.email ? [contact.email] : [])]}
      />
    );
  }

  return (
    <FormGroup>
      <FormControl>
        <InfoMessage
          message={`Please click on the "Get contact" button. 
            You will receive a code that need to be sent to phone number ${smsPaymentPhone} by SMS. Once this is done 
            the contact for this professional will appear here.`}
        />
      </FormControl>
      <FormControl>
        {error ? <ErrorMessage message={error} /> : null}
        {code ? <SuccessMessage message={`Your SMS code is ${code}.`} /> : null}
      </FormControl>
      <UserIdFormControl />
      <FormControl>
        <Button
          onClick={() =>
            call(config.api.endPointsURLs.handleProfessionalContact, 'post', {
              userId,
              professionalId,
            })
          }
          variant="solid"
          colorScheme="blue"
        >
          Get code
        </Button>
      </FormControl>
    </FormGroup>
  );
}

ProfessionalContact.defaultProps = {
  contact: null,
};
ProfessionalContact.prototype.propTypes = {
  professionalId: PropTypes.number.isRequired,
  contact: PropTypes.oneOfType([
    PropTypes.shape({ phone: PropTypes.string, email: PropTypes.string }),
    PropTypes.oneOf([null]),
  ]),
  onContactPaid: PropTypes.func.isRequired,
};
