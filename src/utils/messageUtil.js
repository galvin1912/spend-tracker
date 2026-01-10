import { message as antdMessage } from "antd";

/**
 * Message utility for Redux actions
 * 
 * IMPORTANT: This creates a message instance that can be used in Redux actions.
 * However, the proper way to use message with dynamic theme is to use App.useApp() 
 * hook in components.
 * 
 * For components, use:
 * const { message } = App.useApp();
 * 
 * For Redux actions, we'll use a workaround by creating a message instance
 * that gets initialized from App context.
 */

// This will be set by App component using App.useApp() hook
let messageInstance = null;

export const setMessageInstance = (instance) => {
  messageInstance = instance;
};

const messageUtil = {
  success: (content, duration) => {
    if (messageInstance) {
      return messageInstance.success(content, duration);
    }
    // Fallback to static API if instance not available
    return antdMessage.success(content, duration);
  },
  error: (content, duration) => {
    if (messageInstance) {
      return messageInstance.error(content, duration);
    }
    return antdMessage.error(content, duration);
  },
  warning: (content, duration) => {
    if (messageInstance) {
      return messageInstance.warning(content, duration);
    }
    return antdMessage.warning(content, duration);
  },
  info: (content, duration) => {
    if (messageInstance) {
      return messageInstance.info(content, duration);
    }
    return antdMessage.info(content, duration);
  },
  loading: (content, duration) => {
    if (messageInstance) {
      return messageInstance.loading(content, duration);
    }
    return antdMessage.loading(content, duration);
  },
};

export default messageUtil;
