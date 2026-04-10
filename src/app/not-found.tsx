import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
      <p className="text-muted max-w-md">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
