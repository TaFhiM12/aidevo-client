const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-transparent bg-gradient-to-r from-sky-400 to-blue-500 bg-origin-border p-1">
            <div className="h-full w-full rounded-full bg-white"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500"></div>
        </div>
        <p className="mt-4 text-lg font-medium bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
          Loading Dashboard...
        </p>
      </div>
    </div>
  );
};

export default Loading;