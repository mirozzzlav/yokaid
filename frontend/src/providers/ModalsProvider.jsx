import React, { createContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

function getDefaultModalsState(modalIds) {
  return Object.fromEntries(
    modalIds.map((id) => {
      return [
        id,
        {
          shown: false,
          isScrolledDown: false,
        },
      ];
    }),
  );
}

const ModalsContext = createContext({});
export default function ModalsProvider({ children, modalIds }) {
  const [modalsState, setModalState] = useState(
    getDefaultModalsState(modalIds),
  );

  const contextVal = useMemo(
    () => ({
      setIsShown: (modalId, isShownToSet) =>
        setModalState((prevState) => ({
          ...prevState,
          [modalId]: { ...prevState[modalId], isShown: isShownToSet },
        })),
      getIsShown: (modalId) => !!modalsState[modalId].isShown,
      setIsScrolledDown: (modalId, isScrolledDownToSet) =>
        setModalState((prevState) => ({
          ...prevState,
          [modalId]: {
            ...prevState[modalId],
            isScrolledDown: isScrolledDownToSet,
          },
        })),
      getIsScrolledDown: (modalId) => !!modalsState[modalId].isScrolledDown,
    }),
    [modalsState],
  );

  return (
    <ModalsContext.Provider value={contextVal}>
      {children}
    </ModalsContext.Provider>
  );
}

ModalsProvider.prototype.propTypes = {
  children: PropTypes.node.isRequired,
  modalIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};
