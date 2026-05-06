import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <NavBar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
