import React, { useContext, useMemo } from 'react';
import Page from 'src/routes/Page';
import formConfigFactory from 'src/components/ContactForm';
import { useForms } from 'src/hooks';
import { Box, Button } from '@chakra-ui/react';
import { TranslationsContext } from 'src/providers';
import theme from 'src/style';
import { css } from '@emotion/css';
import Loader, { LoaderWithButton } from 'src/components/Loader';

const style = {
  contactForm: {
    marginTop: theme.space[8],
  },
  intro: {
    marginTop: theme.space[4],
  },
  submit: {
    marginTop: theme.space[6],
  },
};

function Contact(props) {
  const { T } = useContext(TranslationsContext);
  const contactFormConfig = useMemo(() => formConfigFactory(), []);

  const getFormStateAndHelpers = useForms({
    contact: contactFormConfig,
  });

  const { formUI, ...restFormConfig } = contactFormConfig;
  const { formRequestState, submitForm, isLoading, ...formStateAndHelpers } =
    getFormStateAndHelpers('contact');

  return (
    <Page mode="info" {...props} showFullScreenBtn={false}>
      <h2>{T('contact page headline')}</h2>
      <p className={css(style.intro)}>{T('contact page intro')}</p>
      <Box sx={style.contactForm}>
        {React.createElement(formUI, {
          state: formRequestState,
          ...formStateAndHelpers,
          ...restFormConfig,
        })}
        <LoaderWithButton
          sx={style.submit}
          isLoading={isLoading}
          button={{ label: T('submit'), onClick: submitForm }}
        />
      </Box>
    </Page>
  );
}

export default [
  {
    name: 'contact',
    path: 'contact',
    renderer: Contact,
  },
];
