import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { instances, store } from './app/store';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Theme from './features/theme/Theme';

const container = document.getElementById('root')!;
const root = createRoot(container);

export const SagasContext = React.createContext(instances);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <SagasContext.Provider value={instances}>
        <Theme>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Theme>
      </SagasContext.Provider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
