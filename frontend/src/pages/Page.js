import React, { useContext, useMemo, useRef } from 'react';
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
import { FormModals } from 'src/components';
import theme from 'src/style';
import { LoaderContext } from 'src/providers/LoaderProvider';
import { useNavigateAction } from 'src/hooks';
import { getMergedStyle } from 'src/helpers';
import { formModalsConfigPropType } from 'src/constants';
import { TranslationsContext, LanguageDropdown } from 'src/providers';
import config from 'src/config';
import SendSMSFormModal from 'src/components/SendSMSForm';

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
    },
    logoBtn: {
      lineHeight: 1,
    },
    logo: {
      position: 'relative',
      height: '33px',
      width: '100%',
      maxWidth: '100px',
    },
    topContent: {
      padding: '0 2rem',
      flexGrow: 1,
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
    },
  };
  const responsiveStyle = useBreakpointValue({
    base: {
      topInner: { flexWrap: 'wrap' },
      topContent: { order: 3, padding: '1rem 0 0 0', width: '100%' },
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
  onFilterOverlayClick,
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

  const filterRef = useRef();

  return (
    <Box sx={style.container(mode)}>
      <Box sx={style.top}>
        <Box sx={style.loader(isLoading)} />
        <Flex sx={style.topInner}>
          <IconButton
            aria-label="Company Logo"
            variant="unstyled"
            sx={style.logoBtn}
            icon={<Icon as={Logo} sx={style.logo} />}
          />
          <Box sx={style.topContent}>{topContent}</Box>
          <Box sx={style.topRight}>
            <LanguageDropdown
              selectedLanguage={lang}
              languages={config.languages}
              onLanguageSelect={({ value: langCode }) => setLang(langCode)}
            />
          </Box>
        </Flex>
      </Box>
      {filterContent && (
        <Box
          sx={style.filter}
          ref={filterRef}
          onClick={(e) =>
            e.target === filterRef.current && onFilterOverlayClick()
          }
        >
          {filterContent}
        </Box>
      )}
      <Box sx={style.content}>
        {children}
        <FormModals
          modalsConfig={modalsConfig}
          shownModalId={action}
          setShownModalId={navigateAction}
        />
        <SendSMSFormModal
          isShown={action === 'send-sms'}
          onClose={() => navigateAction(null)}
        />
      </Box>
      {footer && <Flex sx={style.footer}>{footer}</Flex>}
    </Box>
  );
}
Page.defaultProps = {
  mode: 'scroll',
  filterContent: null,
  footer: null,
  onFilterOverlayClick: () => {},
  modalsConfig: null,
};

Page.propTypes = {
  children: PropTypes.node.isRequired,
  mode: PropTypes.string,
  topContent: PropTypes.node.isRequired,
  filterContent: PropTypes.oneOfType([PropTypes.node, PropTypes.oneOf([null])]),
  footer: PropTypes.oneOfType([PropTypes.node, PropTypes.oneOf([null])]),
  onFilterOverlayClick: PropTypes.func,
  modalsConfig: PropTypes.oneOfType([
    PropTypes.objectOf(formModalsConfigPropType),
    PropTypes.oneOf([null]),
  ]),
};

export default Page;
