import React, { useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, IconButton, useBreakpointValue } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FullScreenIcon, Logo } from 'src/assets';
import {
  Dropdown,
  FormModals,
  LanguageDropdown,
  Overlay,
  verifyBySmsFormConfigFactory,
} from 'src/components';
import theme from 'src/style';
import { useNavigateAction } from 'src/hooks';
import { getMergedStyle, unknownObjectValidator } from 'src/helpers';
import { formModalsConfigPropType } from 'src/constants';
import { TranslationsContext } from 'src/providers';
import config from 'src/config';
import { HamburgerIcon } from '@chakra-ui/icons';

function useStyle(mode) {
  const style = {
    container: {
      height: '100vh',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
    top: {
      position: 'relative',
      zIndex: 500,
    },
    topInner: {
      alignItems: 'center',
      padding: '1rem 1rem',
      background: '#fff',
      transition: 'padding ease-in .1s',
    },
    topContent: {
      padding: '0 2rem',
      flexGrow: 1,
      width: '100%',
    },
    topRight: {
      display: 'flex',
      flexWrap: 'nowrap',
      marginLeft: 'auto',
    },
    topContentHidden: (isHidden) => ({
      ...(isHidden
        ? {
            padding: '3px 1rem 5px 1rem',
            '> [aria-roledescription="top-content"]': {
              display: 'none',
            },
          }
        : null),
    }),
    fullScreenBtn: (show) => ({
      ...(!show ? { display: 'none' } : null),
      background: '#fff',
      ':hover, :focus, :visited': {
        background: '#fff',
      },
    }),
    content: {
      flexGrow: 1,
      ...(mode === 'info'
        ? {
            padding: `0 ${theme.space[4]} ${theme.space[4]} ${theme.space[4]}`,
            maxWidth: theme.breakpoints.lg,
            margin: '0 auto',
          }
        : null),
      h2: {
        fontSize: '1.6rem',
        margin: `${theme.space[2]} 0 ${theme.space[2]} 0`,
      },
    },
    footer: {
      ...(mode !== 'info'
        ? { position: 'fixed', zIndex: 400, width: '100vw', bottom: 0, left: 0 }
        : null),
      padding: '0 12px 28px 52px',
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
  footerSx,
  isFilterShown,
  isFilterShownSetter,
  modalsConfig: modalsConfigFromProps,
  menuRoutes,
  showFullScreenBtn,
}) {
  const style = useStyle(mode);
  const { navigateAction, action, actionParams } = useNavigateAction();
  const navigate = useNavigate();
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
    <Box sx={style.container}>
      <Box sx={style.top}>
        <Flex
          sx={{ ...style.topInner, ...style.topContentHidden(isFullScreen) }}
        >
          <Link to="/">
            <Logo />
          </Link>
          <Box sx={style.topContent} aria-roledescription="top-content">
            {topContent}
          </Box>
          <Box sx={style.topRight}>
            <LanguageDropdown
              selectedLanguage={lang}
              languages={config.languages}
              onLanguageSelect={({ value: langCode }) => setLang(langCode)}
            />
            <Dropdown
              onItemClick={({ value }) => navigate(!value ? '/' : `/${value}`)}
              buttonMeta={{
                content: <HamburgerIcon />,
                variant: 'ghost',
                style: {
                  '> span': { display: 'none' },
                  '> svg': { fontSize: '1.4rem' },
                  padding: '2px 4px 2px 4px',
                },
              }}
              items={menuRoutes.map(({ name, path }) => ({
                content: T(name),
                value: path,
              }))}
              width="200px"
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
      <Flex sx={{ ...style.footer, ...footerSx }}>
        {footer}
        <IconButton
          aria-label="full screen switch"
          sx={style.fullScreenBtn(showFullScreenBtn)}
          onClick={() => setIsFullScreen((prev) => !prev)}
          icon={<FullScreenIcon exit={isFullScreen} />}
        />
      </Flex>
    </Box>
  );
}
Page.defaultProps = {
  mode: 'map',
  topContent: null,
  filterContent: null,
  footer: null,
  footerSx: null,
  modalsConfig: null,
  isFilterShown: false,
  isFilterShownSetter: () => {},
  showFullScreenBtn: true,
};

Page.propTypes = {
  children: PropTypes.node.isRequired,
  menuRoutes: PropTypes.arrayOf(unknownObjectValidator).isRequired,
  mode: PropTypes.string,
  topContent: PropTypes.oneOfType([PropTypes.node, PropTypes.oneOf([null])]),
  filterContent: PropTypes.oneOfType([PropTypes.node, PropTypes.oneOf([null])]),
  footer: PropTypes.oneOfType([PropTypes.node, PropTypes.oneOf([null])]),
  footerSx: PropTypes.oneOfType([
    unknownObjectValidator,
    PropTypes.oneOf([null]),
  ]),
  isFilterShown: PropTypes.bool,
  isFilterShownSetter: PropTypes.func,
  modalsConfig: PropTypes.oneOfType([
    PropTypes.objectOf(formModalsConfigPropType),
    PropTypes.oneOf([null]),
  ]),
  showFullScreenBtn: PropTypes.bool,
};

export default Page;
