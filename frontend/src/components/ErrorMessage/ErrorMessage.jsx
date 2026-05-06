import './ErrorMessage.css';

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  
  return (
    <div className="error-message">
      <span className="error-icon">⚠</span>
      <span className="error-text">{message}</span>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          [Retry]
        </button>
      )}
    </div>
  );
}
