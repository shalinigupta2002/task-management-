import { toast as notify } from "react-toastify";

const base = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const toast = {
  success: (message, options = {}) => notify.success(message, { ...base, ...options }),
  error: (message, options = {}) => notify.error(message, { ...base, ...options }),
  warning: (message, options = {}) => notify.warning(message, { ...base, ...options }),
  info: (message, options = {}) => notify.info(message, { ...base, ...options }),
};

export default toast;
