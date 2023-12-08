import { ReactComponent as LogoSvg } from 'src/assets/logo.svg';
import { ReactComponent as FilterIconSvg } from 'src/assets/filterIcon.svg';
import { ReactComponent as WorkerIconSvg } from 'src/assets/workerIcon.svg';
import { ReactComponent as LocationIconSvg } from 'src/assets/locationIcon.svg';
import { ReactComponent as SKSvg, ReactComponent as FullScreenSvg } from 'src/assets/SK.svg';
import { ReactComponent as USSvg, ReactComponent as FullScreenExitSvg } from 'src/assets/US.svg';
import { ReactComponent as GhostIconSvg } from 'src/assets/ghostIcon.svg';

import PropTypes from 'prop-types';
import { unknownObjectValidator } from 'src/helpers';
import { Icon } from '@chakra-ui/react';
import React from 'react';

const defaultIconStyle = {
  fontSize: '1.4rem',
};

const defaultProps = {
  sx: null,
};
const propTypes = {
  sx: PropTypes.oneOfType([unknownObjectValidator, PropTypes.oneOf([null])]),
};

function Logo({ sx }) {
  return <Icon
    as={LogoSvg}
    sx={
    { ...{
      height: '33px',
      width: '100px',
      maxWidth: '100px',
  },
...sx }}
  />;
}
Logo.defaultProps = defaultProps;
Logo.prototype.propTypes = propTypes;

function FilterIcon({ sx }) {
  return <Icon as={FilterIconSvg} sx={{ ...defaultIconStyle, ...sx }} />;
}
FilterIcon.defaultProps = defaultProps;
FilterIcon.prototype.propTypes = propTypes;

function WorkerIcon({ sx }) {
  return <Icon as={WorkerIconSvg} sx={{ ...defaultIconStyle, ...sx }} />;
}
WorkerIcon.defaultProps = defaultProps;
WorkerIcon.prototype.propTypes = propTypes;

function LocationIcon({ sx }) {
  return <Icon as={LocationIconSvg} sx={{ ...defaultIconStyle, ...sx }} />;
}
LocationIcon.defaultProps = defaultProps;
LocationIcon.prototype.propTypes = propTypes;

function FlagIcon({ sx, lang }) {
  const flags = {
    sk_SK: SKSvg,
    en_US: USSvg,
  };

  return <Icon as={flags[lang]} sx={{ ...defaultIconStyle, sx }} />;
}
FlagIcon.defaultProps = defaultProps;
FlagIcon.prototype.propTypes = {
  ...propTypes,
  lang: PropTypes.string.isRequired,
};

function FullScreenIcon({ sx, exit }) {
  return <Icon as={exit ? FullScreenExitSvg : FullScreenSvg} sx={{ ...defaultIconStyle, ...sx }} />;
}
FullScreenIcon.defaultProps = {
  exit: false,
  ...defaultProps,
};
FullScreenIcon.prototype.propTypes = {
  ...propTypes,
  exit: PropTypes.bool,
};

function GhostIcon({ sx }) {
  return <Icon as={GhostIconSvg} sx={{ ...defaultIconStyle, '#ghost': sx }} />;
}
GhostIcon.defaultProps = {
  sx: { ...defaultProps, '#ghost': { fill: '#ffffff' } },
};
GhostIcon.prototype.propTypes = propTypes;

const FilterIcons = {
  LocationIcon,
  WorkerIcon,
};
export { Logo, FilterIcon, WorkerIcon, LocationIcon, FlagIcon, FullScreenIcon, GhostIcon, FilterIcons };
