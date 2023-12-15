import React, { useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FullScreenIcon, Logo } from 'src/assets';
import { FormModals, LanguageDropdown, Overlay, verifyBySmsFormConfigFactory } from 'src/components';
import theme from 'src/style';
import { useNavigateAction } from 'src/hooks';
import { getMergedStyle } from 'src/helpers';
import { formModalsConfigPropType } from 'src/constants';
import { TranslationsContext } from 'src/providers';
import config from 'src/config';

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
      zIndex: 500,
    },
    topInner: {
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1rem',
      background: '#fff',
      transition: 'padding ease-in .1s',
    },
    topContent: {
      padding: '0 2rem',
      flexGrow: 1,
      width: '100%',
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
    logoWrapper: {
      display: 'flex',
      alignItems: 'center',
      '> p': {
        textAlign: 'center',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        width: '100px',
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
    lg: {
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
  const style = useStyle();
  const { navigateAction, action, actionParams } = useNavigateAction();
  const { T } = useContext(TranslationsContext);
  const modalsConfig = useMemo(
    () => ({
        ...modalsConfigFromProps,
        'verify-by-sms': {
          title: T('sms verification'),
          submitButton: {
            label: T('submit'),
          },
          formConfig: verifyBySmsFormConfigFactory(actionParams),
        },
      }),
    [action, actionParams, modalsConfigFromProps],
  );
  const { lang, setLang } = useContext(TranslationsContext);
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <Box sx={style.container(mode)}>
      <Box sx={style.top}>
        <Flex sx={{ ...style.topInner, ...style.topContentHidden(isFullScreen) }}>
          <Logo />
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
          icon={<FullScreenIcon exit={isFullScreen} />}
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
