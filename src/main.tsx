import React from 'react'; import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; import './styles/index.css';
import { routerBasename } from './lib/app-base';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={routerBasename()}>
    <App />
  </BrowserRouter>
);
