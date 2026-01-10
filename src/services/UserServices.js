import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { auth } from "../configs/firebase";
import { request } from "../utils/requestUtil";
import store from "../store";
import { translateError } from "../utils/errorTranslator";

class UserServices {
  static register = async (credentials) => {
    const { email, password, fullName, gender } = credentials;

    try {
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
      const translatedError = new Error(translateError(error));
      translatedError.code = error.code;
      translatedError.originalError = error;
      throw translatedError;
    }
  };

  static login = async (credentials) => {
    const { email, password } = credentials;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const translatedError = new Error(translateError(error));
      translatedError.code = error.code;
      translatedError.originalError = error;
      throw translatedError;
    }
  };

  static logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      const translatedError = new Error(translateError(error));
      translatedError.code = error.code;
      translatedError.originalError = error;
      throw translatedError;
    }
  };

  static fetchUserInfo = async (uid) => {
    const user = await request("/users", {
      method: "GET",
      uid,
    });

    return { ...user, uid };
  };

  static fetchOtherUserInfo = async (uid) => {
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
  };

  static updateUserProfile = async (userData) => {
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
  };
}

export default UserServices;
