import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getCountFromServer,
  getAggregateFromServer,
  sum,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../configs/firebase";
import Compressor from "compressorjs";
import { translateError } from "./errorTranslator";

class requestUtil {
  static get = async (url, options) => {
    const { uid, queryConstraints = [] } = options;

    if (uid) {
      // If uid is provided, retrieve a specific document
      const docSnap = await getDoc(doc(db, url, uid));
      return docSnap.data();
    } else {
      // If uid is not provided, perform a query to retrieve multiple documents
      const queries = query(collection(db, url), ...queryConstraints);
      const querySnapshot = await getDocs(queries);

      const queryResult = [];
      querySnapshot.forEach((doc) => queryResult.push({ ...doc.data(), uid: doc.id }));

      return queryResult;
    }
  };

  static getCount = async (url, options) => {
    const { queryConstraints = [] } = options;

    const queries = query(collection(db, url), ...queryConstraints);
    const querySnapshot = await getCountFromServer(queries);

    return querySnapshot.data().count;
  };

  static getSum = async (url, options) => {
    const { queryConstraints = [], field } = options;

    const queries = query(collection(db, url), ...queryConstraints);
    const querySnapshot = await getAggregateFromServer(queries, {
      sum: sum(field),
    });

    return querySnapshot.data().sum;
  };

  static post = async (url, options) => {
    const { data } = options;
    const docRef = await addDoc(collection(db, url), data);
    return docRef;
  };

  static put = async (url, options) => {
    const { uid, data } = options;
    const docRef = await setDoc(doc(db, url, uid), data);
    return docRef;
  };

  static patch = async (url, options) => {
    const { uid, data } = options;
    const docRef = await updateDoc(doc(db, url, uid), data);
    return docRef;
  };

  static delete = async (url, options) => {
    const { uid } = options;
    const docRef = await deleteDoc(doc(db, url, uid));
    return docRef;
  };
}

/**
 * @param {string} url - The url of the collection
 * @param {{
 * method: 'GET' | 'GET_COUNT' | 'GET_SUM' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
 * uid?: string
 * queryConstraints?: Array<import('firebase/firestore').QueryConstraint>
 * data?: Object
 * field?: string - only use for sum
 * }} options - The options object
 */
export const request = async (url, options) => {
  const { method = "GET", ...restOptions } = options;

  try {
    switch (method) {
      case "GET":
        return await requestUtil.get(url, restOptions);
      case "GET_COUNT":
        return await requestUtil.getCount(url, restOptions);
      case "GET_SUM":
        return await requestUtil.getSum(url, restOptions);
      case "POST":
        return await requestUtil.post(url, restOptions);
      case "PUT":
        return await requestUtil.put(url, restOptions);
      case "PATCH":
        return await requestUtil.patch(url, restOptions);
      case "DELETE":
        return await requestUtil.delete(url, restOptions);
      default:
        return await requestUtil.get(url, restOptions);
    }
  } catch (error) {
    // Wrap Firebase errors with translated messages
    const translatedError = new Error(translateError(error));
    translatedError.code = error.code;
    translatedError.originalError = error;
    throw translatedError;
  }
};

/**
 * @param {string} url - The url of the file
 * @param {{
 * file: import('antd/lib/upload').RcFile
 * }} options - The options object
 */
export const uploadFile = async (url, options) => {
  const { file } = options;
  const storageRef = ref(storage, url);
  try {
    const compressedFile = await new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.4,
        success: (result) => {
          resolve(result);
        },
        error: (err) => {
          reject(err);
        },
      });
    });
    const uploadTask = await uploadBytes(storageRef, compressedFile);
    const downloadURL = await getDownloadURL(uploadTask.ref);
    return { downloadURL, url };
  } catch (error) {
    const translatedError = new Error(translateError(error));
    translatedError.code = error.code;
    translatedError.originalError = error;
    throw translatedError;
  }
};

/**
 * @param {string} url - The url of the file
 */
export const deleteFile = async (url) => {
  const storageRef = ref(storage, url);
  try {
    const deleteTask = await deleteObject(storageRef);
    return deleteTask;
  } catch (error) {
    const translatedError = new Error(translateError(error));
    translatedError.code = error.code;
    translatedError.originalError = error;
    throw translatedError;
  }
};

export default requestUtil;
