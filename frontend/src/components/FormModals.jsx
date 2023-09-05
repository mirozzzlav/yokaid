import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'src/components/Modal';
import { useNavigate, useParams } from 'react-router-dom';

function resetSubmitted(modals) {
  return Object.fromEntries(modals.map(({ id }) => [id, false]));
}

export default function FormModals({ modals, shownFormId, setShownFormId }) {
  const [submitted, setSubmittedState] = useState(resetSubmitted(modals));

  const setIsSubmitted = useCallback(
    (isSubmitted) =>
      setSubmittedState((prevState) => ({
        ...prevState,
        [shownFormId]: isSubmitted,
      })),
    [shownFormId],
  );

  useEffect(() => {
    setSubmittedState(resetSubmitted(modals));
  }, [shownFormId]);

  return (
    <>
      {modals.map(({ id, title, form, submitButton }) => (
        <Modal
          key={id}
          title={title}
          isShown={id === shownFormId}
          submitButton={{
            ...submitButton,
            onClick: () => setIsSubmitted(true),
          }}
          setIsShown={(isShown) => setShownFormId(isShown ? id : null)}
        >
          {React.createElement(form, {
            isShown: id === shownFormId,
            setIsShown: (isShown) => setShownFormId(isShown ? id : null),
            isSubmitted: submitted[shownFormId] || false,
            setIsSubmitted,
          })}
        </Modal>
      ))}
    </>
  );
}

FormModals.prototype.propTypes = {
  modals: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      submitButtonLabel: PropTypes.string,
      form: PropTypes.node,
    }),
  ).isRequired,
  shownFormId: PropTypes.string.isRequired,
  setShownFormId: PropTypes.func.isRequired,
};
