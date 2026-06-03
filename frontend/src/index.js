import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom'; // <── ADD THIS
import { store } from './app/store';
import App from './App';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter> {/* <── WRAP HERE */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);