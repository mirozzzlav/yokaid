import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'src/components/Modal';
import { useNavigate, useParams } from 'react-router-dom';

function resetSubmitted(modals) {
  return Object.fromEntries(modals.map(({ id }) => [id, false]));
}

export default function FormModals({ modals, baseUrl }) {
  const [submitted, setSubmittedState] = useState(resetSubmitted(modals));
  const navigate = useNavigate();
  const { formId: urlFormId } = useParams();

  const setIsShown = useCallback(
    (isShown) => {
      if (isShown) {
        navigate(`${baseUrl}/${urlFormId}`);
      } else {
        navigate(baseUrl);
      }
    },
    [urlFormId],
  );
  const setIsSubmitted = useCallback(
    (isSubmitted) =>
      setSubmittedState((prevState) => ({
        ...prevState,
        [urlFormId]: isSubmitted,
      })),
    [urlFormId],
  );

  useEffect(() => {
    setSubmittedState(resetSubmitted(modals));
    if (!urlFormId) {
      navigate(baseUrl);
      return;
    }
    navigate(`${baseUrl}${urlFormId}`);
  }, [urlFormId]);

  return (
    <>
      {modals.map(({ id, form, ...modalProps }) => (
        <Modal
          key={id}
          {...modalProps}
          isShown={id === urlFormId}
          setIsShown={setIsShown}
          setIsSubmitted={setIsSubmitted}
        >
          {React.createElement(form, {
            isShown: id === urlFormId,
            setIsShown,
            isSubmitted: submitted[urlFormId] || false,
            setIsSubmitted,
          })}
        </Modal>
      ))}
    </>
  );
}

FormModals.defaultProps = {
  baseUrl: '/',
};
FormModals.prototype.propTypes = {
  modals: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      submitButtonLabel: PropTypes.string,
      form: PropTypes.node,
    }),
  ).isRequired,
  baseUrl: PropTypes.string,
};
