/**
 * Translates Firebase error codes and messages to Vietnamese
 * @param {Error} error - The error object from Firebase
 * @returns {string} - Vietnamese error message
 */
export const translateError = (error) => {
  if (!error) {
    return "Đã xảy ra lỗi không xác định.";
  }

  // Firebase Auth error codes
  const authErrorMap = {
    "auth/email-already-in-use": "Email này đã được sử dụng. Vui lòng sử dụng email khác.",
    "auth/invalid-email": "Email không hợp lệ. Vui lòng kiểm tra lại.",
    "auth/operation-not-allowed": "Thao tác không được phép. Vui lòng liên hệ hỗ trợ.",
    "auth/weak-password": "Mật khẩu quá yếu. Mật khẩu phải có ít nhất 6 ký tự.",
    "auth/user-disabled": "Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.",
    "auth/user-not-found": "Không tìm thấy người dùng với email này.",
    "auth/wrong-password": "Mật khẩu không đúng. Vui lòng thử lại.",
    "auth/invalid-credential": "Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại email và mật khẩu.",
    "auth/too-many-requests": "Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.",
    "auth/network-request-failed": "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.",
    "auth/requires-recent-login": "Vui lòng đăng nhập lại để thực hiện thao tác này.",
    "auth/popup-closed-by-user": "Cửa sổ đăng nhập đã bị đóng.",
    "auth/cancelled-popup-request": "Yêu cầu đăng nhập đã bị hủy.",
    "auth/popup-blocked": "Cửa sổ đăng nhập đã bị chặn. Vui lòng cho phép popup.",
  };

  // Firebase Firestore error codes
  const firestoreErrorMap = {
    "permission-denied": "Bạn không có quyền thực hiện thao tác này.",
    "not-found": "Không tìm thấy dữ liệu yêu cầu.",
    "unavailable": "Dịch vụ hiện không khả dụng. Vui lòng thử lại sau.",
    "deadline-exceeded": "Thao tác đã hết thời gian chờ. Vui lòng thử lại.",
    "resource-exhausted": "Tài nguyên đã hết. Vui lòng thử lại sau.",
    "failed-precondition": "Điều kiện tiên quyết không được đáp ứng.",
    "aborted": "Thao tác đã bị hủy.",
    "out-of-range": "Giá trị nằm ngoài phạm vi cho phép.",
    "unimplemented": "Tính năng này chưa được triển khai.",
    "internal": "Đã xảy ra lỗi nội bộ. Vui lòng thử lại sau.",
    "data-loss": "Dữ liệu đã bị mất hoặc hỏng.",
    "unauthenticated": "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.",
    "already-exists": "Dữ liệu đã tồn tại.",
    "invalid-argument": "Tham số không hợp lệ.",
  };

  // Firebase Storage error codes
  const storageErrorMap = {
    "storage/unauthorized": "Bạn không có quyền truy cập tệp này.",
    "storage/canceled": "Thao tác tải tệp đã bị hủy.",
    "storage/unknown": "Đã xảy ra lỗi không xác định khi xử lý tệp.",
    "storage/invalid-format": "Định dạng tệp không hợp lệ.",
    "storage/invalid-checksum": "Tệp đã bị hỏng hoặc không đầy đủ.",
    "storage/invalid-event-name": "Tên sự kiện không hợp lệ.",
    "storage/invalid-url": "URL không hợp lệ.",
    "storage/invalid-argument": "Tham số không hợp lệ.",
    "storage/no-default-bucket": "Không tìm thấy bucket mặc định.",
    "storage/cannot-slice-blob": "Không thể chia nhỏ tệp.",
    "storage/server-file-wrong-size": "Kích thước tệp trên server không khớp.",
  };

  // Check error.code first (Firebase errors have codes)
  if (error.code) {
    // Check Auth errors
    if (authErrorMap[error.code]) {
      return authErrorMap[error.code];
    }

    // Check Firestore errors
    if (firestoreErrorMap[error.code]) {
      return firestoreErrorMap[error.code];
    }

    // Check Storage errors
    if (storageErrorMap[error.code]) {
      return storageErrorMap[error.code];
    }

    // Generic Firebase error code pattern
    if (error.code.startsWith("auth/")) {
      return "Lỗi xác thực. Vui lòng thử lại.";
    }
    if (error.code.startsWith("storage/")) {
      return "Lỗi khi xử lý tệp. Vui lòng thử lại.";
    }
    if (error.code.includes("permission") || error.code.includes("denied")) {
      return "Bạn không có quyền thực hiện thao tác này.";
    }
    if (error.code.includes("network") || error.code.includes("unavailable")) {
      return "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.";
    }
  }

  // Check error.message for common patterns
  if (error.message) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
      return "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.";
    }

    // Permission errors
    if (message.includes("permission") || message.includes("denied") || message.includes("unauthorized")) {
      return "Bạn không có quyền thực hiện thao tác này.";
    }

    // Not found errors
    if (message.includes("not found") || message.includes("does not exist")) {
      return "Không tìm thấy dữ liệu yêu cầu.";
    }

    // Invalid input errors
    if (message.includes("invalid") || message.includes("invalid argument")) {
      return "Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại.";
    }

    // Already exists errors
    if (message.includes("already exists") || message.includes("already in use")) {
      return "Dữ liệu đã tồn tại.";
    }

    // Timeout errors
    if (message.includes("timeout") || message.includes("deadline")) {
      return "Thao tác đã hết thời gian chờ. Vui lòng thử lại.";
    }
  }

  // Fallback: return original message if it's already in Vietnamese, otherwise return generic message
  // Check if message contains Vietnamese characters
  if (error.message && /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(error.message)) {
    return error.message;
  }

  // Return generic error message
  return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
};
