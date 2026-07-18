export function ActionButton({ busy, onClick, children }) {
  return (
    <button className="action" disabled={busy} onClick={onClick}>
      {busy && <span className="spinner" />}
      {children}
    </button>
  );
}

export function ErrorLine({ message }) {
  return <span className="error">{message}</span>;
}
