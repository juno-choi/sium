export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
      <p className="mt-2 text-zinc-600">Failed to sign in. Please try again.</p>
      <a
        href="/login"
        className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
      >
        Go to Login
      </a>
    </div>
  );
}
