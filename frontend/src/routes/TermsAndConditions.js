import React from 'react';
import Page from 'src/routes/Page';

function TermsAndConditions(props) {
  return (
    <Page mode="info" {...props} showFullScreenBtn={false}>
      Terms & Conditions Page
    </Page>
  );
}

export default [
  {
    name: 'terms and conditions',
    path: 'terms-and-conditions',
    renderer: TermsAndConditions,
  },
];
