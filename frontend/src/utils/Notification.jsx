import { useSelector } from "react-redux";

const NotificationToast = () => {
  const { message, visible } = useSelector(state => state.notifications);

  console.log('the message and visibility coming here is: ', {message, visible});

  if (!visible) return null;

  return (
    <div className="toast-style">
      {message}
    </div>
  );
};

export default NotificationToast;