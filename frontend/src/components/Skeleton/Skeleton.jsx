import './Skeleton.css';

export function SkeletonRow({ cols }) {
  const widths = ['60%', '40%', '80%', '50%', '70%'];
  
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div 
            className="skeleton-bar" 
            style={{ width: widths[i % widths.length] }} 
          />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-bar" style={{ width: '40%', marginBottom: 'var(--space-sm)' }} />
      <div className="skeleton-bar" style={{ width: '80%', marginBottom: 'var(--space-sm)' }} />
      <div className="skeleton-bar" style={{ width: '60%' }} />
    </div>
  );
}
