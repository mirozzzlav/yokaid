import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import config from 'src/config';

export const IntervalContext = React.createContext({});

export default function IntervalProvider({ children }) {
  const intervalRef = useRef(null);
  const [intervalCounter, setIntervalCounter] = useState(1);
  const [subscribers, setSubscribers] = useState(null);

  const setNextInterval = useCallback(
    () =>
      setIntervalCounter(
        (prevInterval) => ((prevInterval + 1) % Number.MAX_SAFE_INTEGER) + 1,
      ),
    [],
  );

  useEffect(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(
        setNextInterval,
        config.refreshInterval,
      );
    }
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!subscribers) {
      return;
    }
    Object.values(subscribers).forEach((subscriber) => subscriber());
  }, [intervalCounter, subscribers]);

  const contextVal = useMemo(
    () => ({
      setNextInterval,
      addSubscriber: (newSubscriberName, newSubscriber) =>
        setSubscribers((prevSubscribers) =>
          prevSubscribers === null
            ? { [newSubscriberName]: newSubscriber }
            : {
                ...prevSubscribers,
                [newSubscriberName]: newSubscriber,
              },
        ),
      removeSubscriber: (subscriberName) =>
        setSubscribers((prevSubscribers) =>
          prevSubscribers === null
            ? null
            : Object.fromEntries(
                Object.entries(prevSubscribers).filter(
                  ([prevSubscriberName]) =>
                    prevSubscriberName !== subscriberName,
                ),
              ),
        ),
    }),
    [],
  );

  return (
    <IntervalContext.Provider value={contextVal}>
      {children}
    </IntervalContext.Provider>
  );
}

IntervalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
