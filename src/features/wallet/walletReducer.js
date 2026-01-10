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

const initialState = {
  isCreatingWallet: false,
  wallets: [],
  ownerWallets: [],
  joinedWallets: [],
  isWalletsLoading: false,
  isOwnerWalletsLoading: false,
  isJoinedWalletsLoading: false,
  isUpdatingWallet: false,
  isAddingMember: false,
  isRemovingMember: false,
};

const walletReducer = (state = initialState, action) => {
  switch (action.type) {
    case WALLET_CREATE:
      return {
        ...state,
        isCreatingWallet: true,
      };
    case WALLET_CREATE_SUCCESS:
      return {
        ...state,
        isCreatingWallet: false,
      };
    case WALLET_CREATE_FAILED:
      return {
        ...state,
        isCreatingWallet: false,
      };
    case WALLET_GET_WALLETS:
      return {
        ...state,
        isWalletsLoading: true,
      };
    case WALLET_GET_WALLETS_SUCCESS:
      return {
        ...state,
        isWalletsLoading: false,
        wallets: action.payload,
      };
    case WALLET_GET_WALLETS_FAILED:
      return {
        ...state,
        isWalletsLoading: false,
      };
    case WALLET_GET_OWNER_WALLETS:
      return {
        ...state,
        isOwnerWalletsLoading: true,
      };
    case WALLET_GET_OWNER_WALLETS_SUCCESS:
      return {
        ...state,
        isOwnerWalletsLoading: false,
        ownerWallets: action.payload,
      };
    case WALLET_GET_OWNER_WALLETS_FAILED:
      return {
        ...state,
        isOwnerWalletsLoading: false,
      };
    case WALLET_GET_JOINED_WALLETS:
      return {
        ...state,
        isJoinedWalletsLoading: true,
      };
    case WALLET_GET_JOINED_WALLETS_SUCCESS:
      return {
        ...state,
        isJoinedWalletsLoading: false,
        joinedWallets: action.payload,
      };
    case WALLET_GET_JOINED_WALLETS_FAILED:
      return {
        ...state,
        isJoinedWalletsLoading: false,
      };
    case WALLET_UPDATE:
      return {
        ...state,
        isUpdatingWallet: true,
      };
    case WALLET_UPDATE_SUCCESS:
      return {
        ...state,
        isUpdatingWallet: false,
      };
    case WALLET_UPDATE_FAILED:
      return {
        ...state,
        isUpdatingWallet: false,
      };
    case WALLET_ADD_MEMBER:
      return {
        ...state,
        isAddingMember: true,
      };
    case WALLET_ADD_MEMBER_SUCCESS:
      return {
        ...state,
        isAddingMember: false,
      };
    case WALLET_ADD_MEMBER_FAILED:
      return {
        ...state,
        isAddingMember: false,
      };
    case WALLET_REMOVE_MEMBER:
      return {
        ...state,
        isRemovingMember: true,
      };
    case WALLET_REMOVE_MEMBER_SUCCESS:
      return {
        ...state,
        isRemovingMember: false,
      };
    case WALLET_REMOVE_MEMBER_FAILED:
      return {
        ...state,
        isRemovingMember: false,
      };
    default:
      return state;
  }
};

export default walletReducer;
