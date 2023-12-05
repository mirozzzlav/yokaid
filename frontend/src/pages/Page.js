import React, { useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  Icon,
  IconButton,
  keyframes,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ReactComponent as Logo } from 'src/assets/logo.svg';
import { FormModals, LanguageDropdown, Overlay } from 'src/components';
import theme from 'src/style';
import { LoaderContext } from 'src/providers/LoaderProvider';
import { useNavigateAction } from 'src/hooks';
import { getMergedStyle } from 'src/helpers';
import { formModalsConfigPropType } from 'src/constants';
import { TranslationsContext } from 'src/providers';
import config from 'src/config';
import Icons from 'src/components/Icons';

const loaderAnim = keyframes(`
  from {
    width: 0;
  }
  to {
    width: 100%
  }
`);

function useStyle() {
  const style = {
    container: (mode) => ({
      ...(mode === 'fullscreen'
        ? { height: '100vh', overflow: 'hidden' }
        : null),
      display: 'flex',
      flexDirection: 'column',
    }),
    top: {
      position: 'fixed',
      width: '100%',
      zIndex: 1111,
    },
    topInner: {
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1rem',
      background: '#fff',
      transition: 'padding ease-in .1s',
    },
    logoBtn: {
      lineHeight: 1,
    },
    logo: {
      position: 'relative',
      height: '33px',
      width: '100px',
      maxWidth: '100px',
    },
    topContent: {
      padding: '0 2rem',
      flexGrow: 1,
    },
    topContentHidden: (isHidden) => ({
      ...(
        isHidden ?
        {
          padding: '3px 1rem 5px 1rem',
          '> [aria-roledescription="top-content"]': {
            display: 'none',
          },
        } : null
      ),
    }),
    fullScreenBtn: {
      background: '#fff',
      ':hover, :focus, :visited': {
        background: '#fff',
      },
    },
    loader: (isLoading) => ({
      width: '100%',
      height: '2px',
      background: '#fff',
      '::after': {
        content: "' '",
        height: '100%',
        display: isLoading ? 'block' : 'none',
        backgroundColor: theme.colors.blue['600'],
        animation: `${loaderAnim} infinite 5s ease`,
      },
    }),
    filter: {
      position: 'fixed',
      background: theme.colors.blackAlpha[600],
      zIndex: 1111,
      width: '100vw',
      height: '100vh',
      top: 0,
      left: 0,
      '> *': {
        background: '#fff',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '1rem',
      },
    },
    content: {
      flexGrow: 1,
    },
    footer: {
      position: 'fixed',
      zIndex: 400,
      width: '100vw',
      bottom: 0,
      left: 0,
      padding: '0 12px 28px 52px',
      justifyContent: 'right',
      display: 'flex',
      gap: theme.space[2],
    },
  };
  const responsiveStyle = useBreakpointValue({
    base: {
      topInner: { flexWrap: 'wrap' },
      topContent: {
        order: 3,
        padding: '1rem 0 0 0',
      },
    },
    md: {
      topContent: { order: 2 },
      topRight: { order: 3 },
    },
  });
  return getMergedStyle(style, responsiveStyle);
}

function Page({
  children,
  mode,
  topContent,
  filterContent,
  footer,
  isFilterShown,
  isFilterShownSetter,
  modalsConfig: modalsConfigFromProps,
}) {
  const { isLoading } = useContext(LoaderContext);
  const style = useStyle();
  const { navigateAction, action, actionParams } = useNavigateAction();
  const modalsConfig = useMemo(
    () => ({
      ...modalsConfigFromProps,
      // ... some page related modals here if required
    }),
    [action, actionParams, modalsConfigFromProps],
  );
  const { lang, setLang } = useContext(TranslationsContext);
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <Box sx={style.container(mode)}>
      <Box sx={style.top}>
        <Box sx={style.loader(isLoading)} />
        <Flex sx={{ ...style.topInner, ...style.topContentHidden(isFullScreen) }}>
          <IconButton
            aria-label="Company Logo"
            variant="unstyled"
            sx={style.logoBtn}
            icon={<Icon as={Logo} sx={style.logo} />}
          />
          <Box sx={style.topContent} aria-roledescription="top-content">
            {topContent}
          </Box>
          <Box sx={style.topRight}>
            <LanguageDropdown
              selectedLanguage={lang}
              languages={config.languages}
              onLanguageSelect={({ value: langCode }) => setLang(langCode)}
            />
          </Box>
        </Flex>
      </Box>

      <Overlay isShown={isFilterShown} isShownSetter={isFilterShownSetter}>
        {filterContent}
      </Overlay>

      <Box sx={style.content}>
        {children}
        <FormModals
          modalsConfig={modalsConfig}
          shownModalId={action}
          setShownModalId={navigateAction}
        />
      </Box>
      <Flex sx={style.footer}>
        {footer}
        <IconButton
          aria-label="full screen switch"
          sx={style.fullScreenBtn}
          onClick={() => setIsFullScreen((prev) => !prev)}
          icon={<Icons.FullScreenIcon exit={isFullScreen} />}
        />
      </Flex>
    </Box>
  );
}
Page.defaultProps = {
  mode: 'scroll',
  filterContent: null,
  footer: null,
  modalsConfig: null,
};

Page.propTypes = {
  children: PropTypes.node.isRequired,
  mode: PropTypes.string,
  topContent: PropTypes.node.isRequired,
  filterContent: PropTypes.oneOfType([PropTypes.node, PropTypes.oneOf([null])]),
  footer: PropTypes.oneOfType([PropTypes.node, PropTypes.oneOf([null])]),
  isFilterShown: PropTypes.bool.isRequired,
  isFilterShownSetter: PropTypes.func.isRequired,
  modalsConfig: PropTypes.oneOfType([
    PropTypes.objectOf(formModalsConfigPropType),
    PropTypes.oneOf([null]),
  ]),
};

export default Page;
