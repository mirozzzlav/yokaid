import PropTypes from 'prop-types';
import { unknownObjectValidator } from 'src/helpers';
import { Icon } from '@chakra-ui/react';
import React from 'react';

/* eslint-disable import/no-unresolved */
import LogoSvg from 'src/assets/logo.svg?react';
import FilterIconSvg from 'src/assets/filterIcon.svg?react';
import WorkerIconSvg from 'src/assets/workerIcon.svg?react';
import LocationIconSvg from 'src/assets/locationIcon.svg?react';
import SKSvg from 'src/assets/SK.svg?react';
import USSvg from 'src/assets/US.svg?react';
import FullScreenSvg from 'src/assets/fullScreenIcon.svg?react';
import FullScreenExitSvg from 'src/assets/fullScreenExitIcon.svg?react';
import GhostIconSvg from 'src/assets/ghostIcon.svg?react';
/* eslint-disable import/no-unresolved */

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
  return (
    <Icon
      as={LogoSvg}
      sx={{
        ...{
          height: '33px',
          width: '100px',
          maxWidth: '100px',
        },
        ...sx,
      }}
    />
  );
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
  return (
    <Icon
      as={exit ? FullScreenExitSvg : FullScreenSvg}
      sx={{ ...defaultIconStyle, ...sx }}
    />
  );
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
  const { fill, ...restSx } = sx;
  return (
    <Icon
      as={GhostIconSvg}
      sx={{ ...defaultIconStyle, ...restSx, '#ghost': { fill } }}
    />
  );
}
GhostIcon.defaultProps = {
  sx: { ...defaultProps, fill: '#ffffff' },
};
GhostIcon.prototype.propTypes = propTypes;

const FilterIcons = {
  LocationIcon,
  WorkerIcon,
};
export {
  Logo,
  FilterIcon,
  WorkerIcon,
  LocationIcon,
  FlagIcon,
  FullScreenIcon,
  GhostIcon,
  FilterIcons,
};
