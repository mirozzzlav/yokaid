import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Modal from 'src/components/Modal';
import { unknownObjectValidator } from 'src/helpers';
import { useForms } from 'src/hooks';

export default function FormModals({
  modalsConfig,
  shownModalId,
  setShownModalId,
}) {
  const formsConfig = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(modalsConfig).map(([id, { form }]) => [id, form]),
      ),
    [modalsConfig],
  );
  const showFormExtraData = useMemo(
    () => formsConfig[shownModalId]?.extraData || null,
    [formsConfig, shownModalId],
  );
  const getFormStateAndHelpers = useForms(formsConfig);

  useEffect(() => {
    if (!shownModalId) {
      return;
    }
    const { resetForm } = getFormStateAndHelpers(shownModalId);
    resetForm();
  }, [shownModalId, showFormExtraData]);

  return (
    <>
      {Object.entries(modalsConfig).map(
        ([
          id,
          {
            title,
            form: { formUI, extraActions, extraData },
            submitButton,
          },
        ]) => {
          const {
            errorMsg,
            inputsErrors,
            inputs,
            updateInputs,
            formRequestState,
            submitForm,
            validationRules,
          } = getFormStateAndHelpers(id);
          return (
            <Modal
              key={id}
              title={title}
              isShown={id === shownModalId}
              close={() => setShownModalId(null)}
              isScrolledDown={formRequestState.isFinished}
              submitButton={{
                ...submitButton,
                onClick: submitForm,
              }}
            >
              {React.createElement(formUI, {
                errorMsg,
                state: formRequestState,
                inputsErrors,
                inputs,
                updateInputs,
                extraActions,
                extraData,
                validationRules,
              })}
            </Modal>
          );
        },
      )}
    </>
  );
}

FormModals.prototype.propTypes = {
  modalsConfig: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      submitButtonLabel: PropTypes.string,
      form: unknownObjectValidator,
    }),
  ).isRequired,
  shownModalId: PropTypes.string.isRequired,
  setShownModalId: PropTypes.func.isRequired,
};
