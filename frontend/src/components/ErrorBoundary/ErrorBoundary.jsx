import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import './ErrorBoundary.css';

export default function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  let title = "Unexpected Error";
  let message = "Something went wrong. Please try again later.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "404 - Page Not Found";
      message = "The page you are looking for doesn't exist.";
    } else if (error.status === 500) {
      title = "500 - Server Error";
      message = "The server encountered an error.";
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="error-boundary">
      <div className="error-content">
        <h1 className="error-title">{title}</h1>
        <p className="error-message">{message}</p>
        <Link to="/" className="btn-primary">Go Back Home</Link>
      </div>
    </div>
  );
}
