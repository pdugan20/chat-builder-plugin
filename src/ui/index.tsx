import ReactDOM from 'react-dom/client';
import App from './app';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.createRoot(root).render(<App />);
  }
});
