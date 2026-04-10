export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-[calc(100vh-3rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-6" style={{ maxWidth: "100vw" }}>
      {children}
    </div>
  );
}
