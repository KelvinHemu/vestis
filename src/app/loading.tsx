/* ============================================
   Global Loading Component
   Shown during page transitions in Next.js
   Uses Suspense boundaries automatically
   ============================================ */

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm tracking-widest uppercase">Loading...</p>
      </div>
    </div>
  );
}
