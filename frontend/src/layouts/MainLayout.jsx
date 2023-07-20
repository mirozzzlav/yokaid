import React, { useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Icon, IconButton, keyframes } from '@chakra-ui/react';
import { ReactComponent as Logo } from 'src/assets/logo.svg';
import { Login } from 'src/components';
import Modal from 'src/components/Modal';
import { Dropdown } from 'src/components/Dropdown';
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

function MainLayout({ children, mode, topContent }) {
  const [isLoginShown, setIsLoginShown] = useState(false);
  const [isModalSubmitted, setIsModalSubmitted] = useState(false);
  const { isLoading } = useContext(LoaderContext);
  const userMenuItems = useMemo(
    () => [
      { onClick: () => setIsLoginShown(true), label: 'Login', id: 'login' },
      { onClick: () => {}, label: 'Sign up', id: 'signup' },
    ],
    [],
  );
  return (
    <MainLayoutUI
      mode={mode}
      topContent={topContent}
      userMenuItems={userMenuItems}
      isLoginShown={isLoginShown}
      hideLogin={() => setIsLoginShown(false)}
      isModalSubmitted={isModalSubmitted}
      setIsModalSubmitted={setIsModalSubmitted}
      isLoading={isLoading}
    >
      {children}
    </MainLayoutUI>
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

function MainLayoutUI({
  children,
  mode,
  topContent,
  userMenuItems,
  isLoginShown,
  hideLogin,
  isModalSubmitted,
  setIsModalSubmitted,
  isLoading,
}) {
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
      <Modal
        title="Login"
        show={isLoginShown}
        onClose={() => {
          hideLogin();
          setIsModalSubmitted(false);
        }}
        submit={{ label: 'Login', action: () => setIsModalSubmitted(true) }}
      >
        <Login
          isActive={isLoginShown}
          submit={isModalSubmitted}
          onLoginFinish={(success) => {
            if (success) {
              hideLogin();
            }
            setIsModalSubmitted(false);
          }}
        />
      </Modal>
    </Box>
  );
}

MainLayoutUI.defaultProps = {
  isLoading: false,
};
MainLayoutUI.propTypes = {
  children: PropTypes.node.isRequired,
  mode: PropTypes.string.isRequired,
  topContent: PropTypes.node.isRequired,
  userMenuItems: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, onClick: PropTypes.func }),
  ).isRequired,
  isLoginShown: PropTypes.bool.isRequired,
  hideLogin: PropTypes.func.isRequired,
  isModalSubmitted: PropTypes.bool.isRequired,
  setIsModalSubmitted: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default MainLayout;
