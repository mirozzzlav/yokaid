import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Modal from 'src/components/Modal';
import { useForms } from 'src/hooks';
import { formModalsConfigPropType } from 'src/constants';

export default function FormModals({
  modalsConfig,
  shownModalId,
  setShownModalId,
}) {
  const formsConfig = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(modalsConfig).map(([id, { formConfig }]) => [
          id,
          formConfig,
        ]),
      ),
    [modalsConfig],
  );
  const getFormStateAndHelpers = useForms(formsConfig);

  useEffect(() => {
    if (!shownModalId || !formsConfig[shownModalId]) {
      return;
    }
    const { resetForm } = getFormStateAndHelpers(shownModalId);
    resetForm();
  }, [shownModalId]);

  return (
    <>
      {Object.entries(modalsConfig).map(
        ([id, { title, formConfig, submitButton }]) => {
          const { formUI, ...restFormConfig } = formConfig;
          const { formRequestState, submitForm, ...formStateAndHelpers } =
            getFormStateAndHelpers(id);
          return (
            <Modal
              key={id}
              title={title}
              isShown={id === shownModalId}
              close={() => setShownModalId(null)}
              submitButton={{
                ...submitButton,
                onClick: submitForm,
              }}
            >
              {React.createElement(formUI, {
                state: formRequestState,
                ...formStateAndHelpers,
                ...restFormConfig,
              })}
            </Modal>
          );
        },
      )}
    </>
  );
}

FormModals.prototype.propTypes = {
  modalsConfig: PropTypes.arrayOf(formModalsConfigPropType).isRequired,
  shownModalId: PropTypes.string.isRequired,
  setShownModalId: PropTypes.func.isRequired,
};
