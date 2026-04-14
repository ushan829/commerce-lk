export default function AdminLoading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded-xl w-48 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded-xl w-72"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="h-3 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Table header */}
        <div className="flex gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded flex-1"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        {/* Table rows */}
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex gap-4 mb-5">
            <div className="h-4 bg-gray-100 rounded flex-1"></div>
            <div className="h-4 bg-gray-100 rounded w-24"></div>
            <div className="h-4 bg-gray-100 rounded w-20"></div>
            <div className="h-4 bg-gray-100 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
