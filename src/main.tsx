import {createRoot} from 'react-dom/client';
import {initPwaManager} from './hooks/usePWAInstall';
import App from './App.tsx';
import './index.css';

initPwaManager();

createRoot(document.getElementById('root')!).render(<App />);
