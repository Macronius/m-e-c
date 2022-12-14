import React from 'react';
import ReactDOM from 'react-dom/client';
//stuff
import {HelmetProvider} from 'react-helmet-async';
//style
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
//components
import App from './App';
import { StoreProvider } from './store';
//boilerplate stuff
import reportWebVitals from './reportWebVitals';
//paypal
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  //   <StoreProvider>
  //     <HelmetProvider>
  //       <App />
  //     </HelmetProvider>
  //   </StoreProvider>
  // </React.StrictMode>
  <StoreProvider>
    <HelmetProvider>
      <PayPalScriptProvider deferLoading={true}>
        <App />
      </PayPalScriptProvider>
    </HelmetProvider>
  </StoreProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
