import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Icon, IconButton } from '@chakra-ui/react';
import { ReactComponent as Logo } from 'src/assets/logo.svg';
import { Login } from 'src/components';
import Modal from 'src/components/Modal';
import { Dropdown } from 'src/components/Dropdown';

const style = {
  container: (mode) => ({
    ...(mode === 'fullscreen'
      ? { position: 'relative', height: '100vh', overflow: 'hidden' }
      : null),
  }),
  top: {
    position: 'sticky',
    zIndex: 500,
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
  const [isLoginShown, setIsLoginShown] = useState(false);
  const [isModalSubmitted, setIsModalSubmitted] = useState(false);
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
}) {
  return (
    <Box sx={style.container(mode)}>
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
            style: { ':hover': { background: 'none' } },
          }}
        />
      </Box>
      <Box sx={style.content(mode)}>{children}</Box>
      <Modal
        title="Login"
        show={isLoginShown}
        onClose={() => {
          hideLogin();
          setIsModalSubmitted(false);
        }}
        submit={{ label: 'Login', action: () => setIsModalSubmitted(true) }}
        isLoaderShown={isModalSubmitted}
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
};

export default MainLayout;
