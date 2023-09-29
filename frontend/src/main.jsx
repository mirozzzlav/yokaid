import React from 'react';
import ReactDOM from 'react-dom/client';
import theme from 'src/style';
import App from 'src/App';

import { ChakraProvider } from '@chakra-ui/react';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
