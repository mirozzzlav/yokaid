import { Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
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
import { InitialDataContext, UserIdContext } from 'src/providers';
import DataContent from 'src/components/DataContent';
import MultiItem from 'src/components/MultiItem';

function ProfessionalContactInfo({ contact }) {
  return (
    <FormGroup>
      <FormControl>
        <DataContent
          data={[
            {
              headline: 'Professional Contact',
              content: (
                <MultiItem
                  labels={[
                    contact.phone,
                    ...(contact.email ? [contact.email] : []),
                  ]}
                />
              ),
            },
          ]}
        />
      </FormControl>
    </FormGroup>
  );
}

ProfessionalContactInfo.prototype.propTypes = {
  contact: PropTypes.shape({ phone: PropTypes.string, email: PropTypes.string })
    .isRequired,
};

export default function ProfessionalContact({
  professionalId,
  contact,
  onContactPaid,
}) {
  const {
    userId,
    setUserId,
    saveUserId,
    getErrorMsg,
    inputFormat: userIdInputFormat,
  } = useContext(UserIdContext);
  const [phoneError, setPhoneError] = useState(null);
  const [code, setCode] = useState('');
  const { smsPaymentPhone } = useContext(InitialDataContext);

  const call = useCall((response) => {
    if (response.error) {
      setPhoneError(getErrorMsg(response.error));
    } else {
      if (response.data.contact) {
        onContactPaid((prevState) => ({
          ...prevState,
          contact: response.data.contact,
        }));
      }
      setPhoneError('');
      saveUserId();
    }

    setCode(response.data?.code || '');
  });

  if (contact) {
    return <ProfessionalContactInfo contact={contact} />;
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
        {phoneError ? <ErrorMessage message={phoneError} /> : null}
        {code ? <SuccessMessage message={`Your SMS code is ${code}`} /> : null}
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Your phone</FormLabel>
        <Input
          placeholder={userIdInputFormat}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <Button
          onClick={() =>
            call(
              `${
                config.api.endPointsURLs.getProfessionsContact
              }/${professionalId}${userId ? `/${userId}` : ''}`,
            )
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
  professionalId: PropTypes.number,
  contact: PropTypes.oneOfType([
    PropTypes.shape({ phone: PropTypes.string, email: PropTypes.string }),
    PropTypes.oneOf([null]),
  ]),
  onContactPaid: PropTypes.func.isRequired,
};
