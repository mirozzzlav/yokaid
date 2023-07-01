import ReactDOM from 'react-dom';
import React from 'react';
import PropTypes from 'prop-types';

const portalElement = document.getElementById('modals');

function ModalOverlay({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}

ModalOverlay.propTypes = {
  children: PropTypes.node.isRequired,
};

function Modal(props) {
  return ReactDOM.createPortal(<ModalOverlay>{props.message}</ModalOverlay>, portalElement);
}

export default Modal;
