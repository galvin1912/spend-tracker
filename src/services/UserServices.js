import {
  createUserWithEmailAndPassword,
  // signInWithEmailAndPassword,
} from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { auth } from "../configs/firebase";
import { request } from "../utils/requestUtil";

class UserServices {
  static register = async (credentials) => {
    const { email, password, fullName, gender } = credentials;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    const newUser = {
      uid: user.uid,
      email,
      avatarUrl: "",
      fullName,
      gender,
      createdAt: Timestamp.now(),
      updatedAt: null,
    };

    const response = await request("users", {
      method: "PUT",
      uid: user.uid,
      data: newUser,
    });

    return response;
  };
}

export default UserServices;
