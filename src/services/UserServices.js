import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { auth } from "../configs/firebase";
import { request } from "../utils/requestUtil";
import store from "../store";
import { translateError } from "../utils/errorTranslator";

class UserServices {
  static register = async (credentials) => {
    const methodName = 'register';
    const params = { 
      email: credentials?.email,
      fullName: credentials?.fullName,
      gender: credentials?.gender,
      // Don't log password
    };
    try {
      const { email, password, fullName, gender } = credentials;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      const newUser = {
        email,
        avatarUrl: "",
        fullName,
        gender,
        groups: [],
        wallets: [],
        createdAt: Timestamp.now(),
        updatedAt: null,
      };

      await request("/users", {
        method: "PUT",
        uid: user.uid,
        data: newUser,
      });
    } catch (error) {
      console.error(`[UserServices.${methodName}] Error:`, {
        method: methodName,
        params: params,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
          originalError: error.originalError || error,
        },
      });
      const translatedError = new Error(translateError(error));
      translatedError.code = error.code;
      translatedError.originalError = error;
      throw translatedError;
    }
  };

  static login = async (credentials) => {
    const methodName = 'login';
    const params = { 
      email: credentials?.email,
      // Don't log password
    };
    try {
      const { email, password } = credentials;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(`[UserServices.${methodName}] Error:`, {
        method: methodName,
        params: params,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
          originalError: error.originalError || error,
        },
      });
      const translatedError = new Error(translateError(error));
      translatedError.code = error.code;
      translatedError.originalError = error;
      throw translatedError;
    }
  };

  static logout = async () => {
    const methodName = 'logout';
    const params = {};
    try {
      await signOut(auth);
    } catch (error) {
      console.error(`[UserServices.${methodName}] Error:`, {
        method: methodName,
        params: params,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
          originalError: error.originalError || error,
        },
      });
      const translatedError = new Error(translateError(error));
      translatedError.code = error.code;
      translatedError.originalError = error;
      throw translatedError;
    }
  };

  static fetchUserInfo = async (uid) => {
    const methodName = 'fetchUserInfo';
    const params = { uid };
    try {
      const user = await request("/users", {
        method: "GET",
        uid,
      });

      return { ...user, uid };
    } catch (error) {
      console.error(`[UserServices.${methodName}] Error:`, {
        method: methodName,
        params: params,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
          originalError: error.originalError || error,
        },
      });
      throw error;
    }
  };

  static fetchOtherUserInfo = async (uid) => {
    const methodName = 'fetchOtherUserInfo';
    const params = { uid };
    try {
      const user = await request("/users", {
        method: "GET",
        uid,
      });

      return {
        uid,
        fullName: user?.fullName,
        avatarUrl: user?.avatarUrl,
        email: user?.email,
        gender: user?.gender,
      };
    } catch (error) {
      console.error(`[UserServices.${methodName}] Error:`, {
        method: methodName,
        params: params,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
          originalError: error.originalError || error,
        },
      });
      throw error;
    }
  };

  static updateUserProfile = async (userData) => {
    const methodName = 'updateUserProfile';
    const params = { 
      userData: {
        fullName: userData?.fullName,
        gender: userData?.gender,
        avatarUrl: userData?.avatarUrl ? '[present]' : null,
      }
    };
    try {
      const { user } = store.getState().user;
      
      if (!user || !user.uid) {
        throw new Error("Không tìm thấy thông tin người dùng!");
      }

      const updatedData = {
        ...userData,
        updatedAt: Timestamp.now(),
      };

      await request("/users", {
        method: "PATCH",
        uid: user.uid,
        data: updatedData,
      });

      // Return the complete updated user object
      const updatedUser = await UserServices.fetchUserInfo(user.uid);
      return updatedUser;
    } catch (error) {
      console.error(`[UserServices.${methodName}] Error:`, {
        method: methodName,
        params: params,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
          originalError: error.originalError || error,
        },
      });
      throw error;
    }
  };
}

export default UserServices;
