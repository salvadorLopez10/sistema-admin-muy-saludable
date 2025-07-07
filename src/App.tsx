import { BrowserRouter as Router } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { AppRoutes } from './routes/AppRoutes';
import './index.css';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-y-auto w-full">
          <AppRoutes />
        </div>
      </div>
    </Router>
  );
}
export default App;