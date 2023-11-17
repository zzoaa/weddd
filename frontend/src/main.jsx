// eslint-disable-next-line no-unused-vars
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux';
import store from './store/store';
import AppRouter from './routes/AppRouter'; // Import your AppRouter component


ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AppRouter /> {/* Render your AppRouter */}
  </Provider>,
)
