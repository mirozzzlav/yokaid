import React from 'react';
import Page from 'src/routes/Page';

function Contact(props) {
  return (
    <Page mode="info" {...props}>
      Contact Page
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
