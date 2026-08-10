// Placeholder — used by future dashboard layouts
export default function Sidebar({ children }) {
  return (
    <aside
      className="w-64 flex-shrink-0 p-4 border-r hidden lg:block"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {children}
    </aside>
  );
}