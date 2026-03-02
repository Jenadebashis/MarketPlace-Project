import { useSelector } from "react-redux";

const NotificationToast = () => {
  const { message, visible } = useSelector(state => state.notifications);

  return (
    <div 
      className={`
        fixed left-1/2 -translate-x-1/2 top-16 z-40
        transition-all duration-500 ease-in-out
        ${visible ? 'translate-y-4 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}
      `}
    >
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-gray-100">
        {/* Status Indicator */}
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        
        <span className="text-sm font-medium text-gray-800">
          {message}
        </span>
      </div>
    </div>
  );
};

export default NotificationToast;