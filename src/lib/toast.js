import { showToast } from '@components/ui/Toast';

const toast = (message, options = {}) =>
  showToast.mini(message, options);

toast.success = (message, options = {}) =>
  showToast.success(message, options);

toast.error = (message, options = {}) =>
  showToast.error(message, options);

toast.warning = (message, options = {}) =>
  showToast.warning(message, options);

toast.info = (message, options = {}) =>
  showToast.mini(message, { type: 'info', ...options });

toast.loading = (message, options = {}) =>
  showToast.loading(message, options);

toast.promise = (promise, msgs = {}) =>
  showToast.promise(promise, msgs);

toast.dismiss = (id) => showToast.dismiss(id);

// Mini toast — non-blocking corner notification
toast.mini = (message, options = {}) =>
  showToast.mini(message, options);

export default toast;