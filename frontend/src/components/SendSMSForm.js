import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { ErrorMessage, SuccessMessage } from 'src/components/Messages';
import { TranslationsContext } from 'src/providers';
import Modal from 'src/components/Modal';
import config from 'src/config';
import useCall from '../hooks/useCall';

export default function SendSMSFormModal({ isShown, onClose }) {
  const { T } = useContext(TranslationsContext);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const { call } = useCall((response, success) => {
    if (!success) {
      setError(`${T(response.msg || 'unknown error')}`);
      return;
    }
    setError('');
  });
  useEffect(() => {
    if (isShown) {
      setCode('');
      setError(null);
    }
  }, [isShown]);

  return (
    <Modal
      isShown={isShown}
      close={onClose}
      title={T('sms payment')}
      submitButton={{
        label: T('submit'),
        onClick: () => call(config.api.endPointsURLs.makePayment, [code]),
      }}
    >
      <Box>
        <FormControl isRequired>
          <FormLabel>{T('payment code')}</FormLabel>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {/* <FormErrorMessage>{inputsErrors?.code}</FormErrorMessage> */}
        </FormControl>
        {error ? <ErrorMessage message={T(error)} /> : null}
        {!error && error !== null ? (
          <SuccessMessage message={T('payment successful', [code])} />
        ) : null}
      </Box>
    </Modal>
  );
}
SendSMSFormModal.defaultProps = {};

SendSMSFormModal.prototype.propTypes = {
  isShown: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
