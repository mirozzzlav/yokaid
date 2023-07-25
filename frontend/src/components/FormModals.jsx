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
  const { action: urlAction } = useParams();

  const setIsShown = useCallback((formId, isShown) => {
    if (isShown) {
      navigate(`${baseUrl}/${urlAction}`);
    } else {
      navigate(baseUrl);
    }
  });
  const setIsSubmitted = useCallback(
    (formId, isSubmitted) =>
      setSubmittedState((prevState) => ({
        ...prevState,
        [formId]: isSubmitted,
      })),
    [],
  );

  useEffect(() => {
    setSubmittedState(resetSubmitted(modals));
    if (!urlAction) {
      navigate(baseUrl);
      return;
    }
    navigate(`${baseUrl}${urlAction}`);
  }, [urlAction]);

  return (
    <>
      {modals.map(({ id, form, ...modalProps }) => (
        <Modal
          key={id}
          {...modalProps}
          isShown={id === urlAction}
          setIsShown={(isShown) => setIsShown(id, isShown)}
          setIsSubmitted={(isSubmitted) => setIsSubmitted(id, isSubmitted)}
        >
          {React.createElement(form, {
            isShown: id === urlAction,
            setIsShown: (isShown) => setIsShown(id, isShown),
            isSubmitted: submitted[id],
            setIsSubmitted: (isSubmitted) => setIsSubmitted(id, isSubmitted),
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
