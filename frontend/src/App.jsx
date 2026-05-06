import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Market from './market/market';
import Benchmarks from './benchmarks/benchmarks';
import Compare from './compare/compare';
import Calculate, { action as calculateAction } from './pages/Calculate/Calculate';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Market />
      },
      {
        path: 'benchmarks',
        element: <Benchmarks />
      },
      {
        path: 'compare',
        element: <Compare />
      },
      {
        path: 'calculate',
        element: <Calculate />,
        action: calculateAction
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
