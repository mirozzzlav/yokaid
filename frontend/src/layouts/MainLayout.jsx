import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Icon, IconButton, keyframes } from '@chakra-ui/react';
import { ReactComponent as Logo } from 'src/assets/logo.svg';
import { Dropdown } from 'src/components';
import { theme } from 'src/style';
import { LoaderContext } from 'src/providers/LoaderProvider';

const loaderAnim = keyframes(`
  from {
    width: 0;
  }
  to {
    width: 100%
  }
`);

const style = {
  container: (mode) => ({
    ...(mode === 'fullscreen' ? { height: '100vh', overflow: 'hidden' } : null),
    display: 'flex',
    flexDirection: 'column',
  }),
  top: {
    position: 'sticky',
    flexGrow: 0,
    zIndex: 500,
    background: 'rgba(255,255,255, 0.9)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1rem 1rem 1rem',
  },
  loader: (isLoading) => ({
    height: '2px',
    width: '100%',
    '> *': {
      height: '100%',
      width: '0',
      backgroundColor: `${theme.colors.blue['600']}`,
      ...(isLoading && { animation: `${loaderAnim} infinite 5s ease` }),
    },
  }),
  content: {
    flexGrow: 1,
  },
};

function MainLayout({ children, mode, topContent, userMenuItems }) {
  const { isLoading } = useContext(LoaderContext);

  return (
    <Box sx={style.container(mode)}>
      <Box sx={style.loader(isLoading)}>
        <Box />
      </Box>
      <Box sx={style.top}>
        <Box>
          <IconButton
            aria-label="Company Logo"
            mr={6}
            variant="link"
            icon={<Icon width="6rem" height="2rem" as={Logo} />}
          />
        </Box>
        <Box>{topContent}</Box>
        <Dropdown
          items={userMenuItems}
          buttonMeta={{
            content: <Avatar size="sm" />,
            variant: 'ghost',
            style: { ':hover': { background: 'none' }, padding: 0 },
          }}
        />
      </Box>
      <Box sx={style.content}>{children}</Box>
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
  userMenuItems: PropTypes.arrayOf(
    PropTypes.shape({
      onClick: PropTypes.func,
      label: PropTypes.string,
      id: PropTypes.string,
    }),
  ),
};

export default MainLayout;
