import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Context from './components/ContextProvider/Context';
import { BrowserRouter } from "react-router-dom"
import App from './App';
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Context>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </Context>

);

