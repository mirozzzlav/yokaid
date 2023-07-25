import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'src/components/Modal';

function getInitialModalStates(modals) {
  return Object.fromEntries(
    modals.map(({ id }) => [
      id,
      {
        isShown: false,
        isSubmitted: false,
      },
    ]),
  );
}

export default function FormModals({ modals, shownModal, setShownModal }) {
  const [formStates, setFormStates] = useState(getInitialModalStates(modals));
  const { setIsShown, setIsSubmitted } = useMemo(
    () => ({
      setIsShown: (formId, isShown) => {
        setFormStates((prevFormStates) => ({
          ...prevFormStates,
          [formId]: { ...prevFormStates[formId], isShown },
        }));
        setShownModal(false);
      },
      setIsSubmitted: (formId, isSubmitted) =>
        setFormStates((prevFormStates) => ({
          ...prevFormStates,
          [formId]: { ...prevFormStates[formId], isSubmitted },
        })),
    }),
    [formStates],
  );

  useEffect(() => {
    if (!shownModal) {
      return;
    }
    setFormStates((prevState) => ({
      ...prevState,
      [shownModal]: { isSubmitted: false, isShown: true },
    }));
  }, [shownModal]);

  return (
    <>
      {modals.map(({ id, form, ...modalProps }) => (
        <Modal
          key={id}
          {...modalProps}
          isShown={formStates[id].isShown}
          setIsShown={(isShown) => setIsShown(id, isShown)}
          setIsSubmitted={(isSubmitted) => setIsSubmitted(id, isSubmitted)}
        >
          {React.createElement(form, {
            isShown: formStates[id].isShown,
            setIsShown: (isShown) => setIsShown(id, isShown),
            isSubmitted: formStates[id].isSubmitted,
            setIsSubmitted: (isSubmitted) => setIsSubmitted(id, isSubmitted),
          })}
        </Modal>
      ))}
    </>
  );
}

FormModals.defaultProps = {
  shownModal: '',
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
  shownModal: PropTypes.string,
  setShownModal: PropTypes.func.isRequired,
};
