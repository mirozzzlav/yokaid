import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

export default function OutClickDetector({ children, id }) {
  const [isOpen, setIsOpen] = useState(null);
  const ref = useRef();

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    setIsOpen(true);
  }, [id]);

  // Attach click event listener when the component mounts
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      // Remove the event listener when the component unmounts
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return <div ref={ref}>{isOpen !== false && children}</div>;
}

OutClickDetector.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.number.isRequired,
};
