import WalletServices from "../../services/WalletServices";
import { translateError } from "../../utils/errorTranslator";
import messageUtil from "../../utils/messageUtil";
import {
  WALLET_CREATE,
  WALLET_CREATE_SUCCESS,
  WALLET_CREATE_FAILED,
  WALLET_GET_WALLETS,
  WALLET_GET_WALLETS_SUCCESS,
  WALLET_GET_WALLETS_FAILED,
  WALLET_GET_OWNER_WALLETS,
  WALLET_GET_OWNER_WALLETS_SUCCESS,
  WALLET_GET_OWNER_WALLETS_FAILED,
  WALLET_GET_JOINED_WALLETS,
  WALLET_GET_JOINED_WALLETS_SUCCESS,
  WALLET_GET_JOINED_WALLETS_FAILED,
  WALLET_UPDATE,
  WALLET_UPDATE_SUCCESS,
  WALLET_UPDATE_FAILED,
  WALLET_ADD_MEMBER,
  WALLET_ADD_MEMBER_SUCCESS,
  WALLET_ADD_MEMBER_FAILED,
  WALLET_REMOVE_MEMBER,
  WALLET_REMOVE_MEMBER_SUCCESS,
  WALLET_REMOVE_MEMBER_FAILED,
} from "./walletConstants";

export const createWallet = (walletData) => async (dispatch) => {
  dispatch({ type: WALLET_CREATE });

  try {
    await WalletServices.createWallet(walletData);
    dispatch({ type: WALLET_CREATE_SUCCESS });
    messageUtil.success("Tạo ví thành công");
  } catch (error) {
    dispatch({ type: WALLET_CREATE_FAILED });
    messageUtil.error(translateError(error) || "Không thể tạo ví");
    throw error;
  }
};

export const getWallets = () => async (dispatch) => {
  dispatch({ type: WALLET_GET_WALLETS });

  try {
    const wallets = await WalletServices.getWallets();
    dispatch({ type: WALLET_GET_WALLETS_SUCCESS, payload: wallets });
  } catch (error) {
    dispatch({ type: WALLET_GET_WALLETS_FAILED });
    messageUtil.error(translateError(error) || "Không thể tải danh sách ví");
  }
};

export const getOwnerWallets = () => async (dispatch) => {
  dispatch({ type: WALLET_GET_OWNER_WALLETS });

  try {
    const wallets = await WalletServices.getOwnerWallets();
    dispatch({ type: WALLET_GET_OWNER_WALLETS_SUCCESS, payload: wallets });
  } catch (error) {
    dispatch({ type: WALLET_GET_OWNER_WALLETS_FAILED });
    messageUtil.error(translateError(error) || "Không thể tải danh sách ví của bạn");
  }
};

export const getJoinedWallets = () => async (dispatch) => {
  dispatch({ type: WALLET_GET_JOINED_WALLETS });

  try {
    const wallets = await WalletServices.getJoinedWallets();
    dispatch({ type: WALLET_GET_JOINED_WALLETS_SUCCESS, payload: wallets });
  } catch (error) {
    dispatch({ type: WALLET_GET_JOINED_WALLETS_FAILED });
    messageUtil.error(translateError(error) || "Không thể tải danh sách ví đã tham gia");
  }
};

export const updateWallet = (walletID, walletData) => async (dispatch) => {
  dispatch({ type: WALLET_UPDATE });

  try {
    await WalletServices.updateWallet(walletID, walletData);
    dispatch({ type: WALLET_UPDATE_SUCCESS });
    messageUtil.success("Cập nhật ví thành công");
  } catch (error) {
    dispatch({ type: WALLET_UPDATE_FAILED });
    messageUtil.error(translateError(error) || "Không thể cập nhật ví");
    throw error;
  }
};

export const addMember = (walletID, memberID) => async (dispatch) => {
  dispatch({ type: WALLET_ADD_MEMBER });

  try {
    await WalletServices.addMember(walletID, memberID);
    dispatch({ type: WALLET_ADD_MEMBER_SUCCESS });
    messageUtil.success("Thêm thành viên thành công");
  } catch (error) {
    dispatch({ type: WALLET_ADD_MEMBER_FAILED });
    messageUtil.error(translateError(error) || "Không thể thêm thành viên");
    throw error;
  }
};

export const removeMember = (walletID, memberID) => async (dispatch) => {
  dispatch({ type: WALLET_REMOVE_MEMBER });

  try {
    await WalletServices.removeMember(walletID, memberID);
    dispatch({ type: WALLET_REMOVE_MEMBER_SUCCESS });
    messageUtil.success("Xóa thành viên thành công");
  } catch (error) {
    dispatch({ type: WALLET_REMOVE_MEMBER_FAILED });
    messageUtil.error(translateError(error) || "Không thể xóa thành viên");
    throw error;
  }
};
