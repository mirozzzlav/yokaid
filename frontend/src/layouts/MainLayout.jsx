import React from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { ReactComponent as Logo } from 'src/assets/logo.svg';

const style = {
  container: (mode) => ({
    ...(mode === 'fullscreen'
      ? { position: 'relative', height: '100vh', overflow: 'hidden' }
      : null),
  }),
  top: {
    position: 'sticky',
    zIndex: 9999,
    background: 'rgba(255,255,255, 0.9)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
  },
  content: (mode) =>
    mode === 'fullscreen' && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
};

function MainLayout({ children, mode, topContent }) {
  return (
    <Box sx={style.container(mode)}>
      <Box sx={style.top}>
        <Box>
          <IconButton
            mr={6}
            variant="link"
            icon={<Icon width="6rem" height="2rem" as={Logo} />}
          />
        </Box>
        <Box>{topContent}</Box>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<Avatar size="sm" />}
            variant="link"
          />
          <MenuList>
            <MenuItem command="⌘⇧N">Open Closed Tab</MenuItem>
            <MenuItem command="⌘O">Open File...</MenuItem>
          </MenuList>
        </Menu>
      </Box>
      <Box sx={style.content(mode)}>{children}</Box>
    </Box>
  );
}

MainLayout.defaultProps = {
  mode: 'scroll',
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  mode: PropTypes.string,
  topContent: PropTypes.node.isRequired,
};

export default MainLayout;
