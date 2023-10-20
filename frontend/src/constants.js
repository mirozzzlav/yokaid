import PropTypes from 'prop-types';
import { unknownObjectValidator } from 'src/helpers';

const callStates = {
  initial: 'initial',
  loading: 'loading',
  finished: 'finished',
};

const buttonPropType = PropTypes.shape({
  label: PropTypes.string,
  onClick: PropTypes.func,
});

const formModalsConfigPropType = PropTypes.shape({
  title: PropTypes.string,
  submitButton: buttonPropType,
  formConfig: unknownObjectValidator,
});

export { callStates, formModalsConfigPropType, buttonPropType };
