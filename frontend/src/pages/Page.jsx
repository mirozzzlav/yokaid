import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Icon, IconButton, keyframes } from '@chakra-ui/react';
import { ReactComponent as Logo } from 'src/assets/logo.svg';
import {
  Dropdown,
  FormModals,
  loginFormFactory,
  signupFormFactory,
} from 'src/components';
import { theme } from 'src/style';
import { LoaderContext } from 'src/providers/LoaderProvider';
import { AuthContext } from 'src/providers';
import config from 'src/config';
import { useNavigateAction } from 'src/hooks';

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
    boxShadow: theme.shadows.md,
  },
  topContent: {
    display: 'flex',
    gap: '0.5rem',
    width: '850px',
    justifyContent: 'space-between',
    '> *': {
      flexBasis: '100%',
    },
  },
  loader: (isLoading) => ({
    height: '2px',
    width: '100%',
    '> *': {
      height: '100%',
      width: '0',
      backgroundColor: theme.colors.blue['600'],
      ...(isLoading && { animation: `${loaderAnim} infinite 5s ease` }),
    },
  }),
  content: {
    flexGrow: 1,
  },
};

function Page({ children, mode, topContent }) {
  const { isLoading } = useContext(LoaderContext);
  const { isAuthorized } = useContext(AuthContext);
  const { logOut } = useContext(AuthContext);

  const { navigate, action, actionParams, navigateAction } =
    useNavigateAction();
  const userMenuItems = useMemo(
    () =>
      (isAuthorized
        ? config.userMenuItems.authorized
        : config.userMenuItems.unauthorized
      ).map((item) => ({ ...item, onClick: () => navigate(item.link) })),
    [isAuthorized],
  );
  const modalsConfig = useMemo(
    () => ({
      login: {
        title: 'Login',
        submitButton: {
          label: 'Login',
        },
        form: loginFormFactory(),
      },
      signup: {
        title: 'Sign up',
        submitButton: {
          label: 'Sign up',
        },
        form: signupFormFactory(),
      },
    }),
    [action, actionParams],
  );

  useEffect(() => {
    if (action === 'logout') {
      logOut();
    }
  }, [action]);

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
        <Box sx={style.topContent}>{topContent}</Box>
        <Dropdown
          items={userMenuItems}
          width="110px"
          buttonMeta={{
            content: <Avatar size="sm" />,
            variant: 'ghost',
            style: {
              padding: 0,
              borderRadius: '50%',
              ...(isAuthorized
                ? {
                    background: theme.colors.green['100'],
                    ':hover': { background: theme.colors.green['200'] },
                  }
                : {
                    background: theme.colors.gray['50'],
                    ':hover': { background: theme.colors.gray['200'] },
                  }),
            },
          }}
        />
      </Box>
      <Box sx={style.content}>
        {children}
        <FormModals
          modalsConfig={modalsConfig}
          shownModalId={action}
          setShownModalId={navigateAction}
        />
      </Box>
    </Box>
  );
}
Page.defaultProps = {
  mode: 'scroll',
};

Page.propTypes = {
  children: PropTypes.node.isRequired,
  mode: PropTypes.string,
  topContent: PropTypes.node.isRequired,
};

export default Page;
