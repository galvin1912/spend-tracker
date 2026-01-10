import { Timestamp, where, documentId, limit } from "firebase/firestore";
import { request } from "../utils/requestUtil";
import store from "../store";

class WalletServices {
  static createWallet = async (walletData, ownerUID = null) => {
    const methodName = 'createWallet';
    const params = { 
      walletData: { walletName: walletData?.walletName },
      ownerUID: ownerUID || null,
    };
    try {
      // Get uid from parameter or from store
      const uid = ownerUID || store.getState().user?.user?.uid;
      
      if (!uid) {
        throw new Error("User UID is required to create wallet");
      }

      const newWallet = {
        ...walletData,
        owner: uid,
        members: [],
        groups: [],
        createdAt: Timestamp.now(),
        updatedAt: null,
      };

      // Create wallet
      const walletRef = await request("/wallets", {
        method: "POST",
        data: newWallet,
      });

      // Get current user data to update wallets array
      const currentUser = await request("/users", {
        method: "GET",
        uid: uid,
      });

      // Add wallet to user's wallets
      await request("/users", {
        method: "PATCH",
        uid: uid,
        data: {
          wallets: [...(currentUser?.wallets || []), walletRef.id],
        },
      });

      return walletRef.id;
    } catch (error) {
      console.error(`[WalletServices.${methodName}] Error:`, {
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

  static getWallets = async () => {
    const methodName = 'getWallets';
    const params = {};
    try {
      const { user } = store.getState().user;

      if (!user?.wallets?.length) return [];

      const wallets = await request("/wallets", {
        method: "GET",
        queryConstraints: [where(documentId(), "in", user.wallets), limit(10)],
      });

      wallets.sort((a, b) => a?.walletName.localeCompare(b?.walletName));

      return wallets;
    } catch (error) {
      console.error(`[WalletServices.${methodName}] Error:`, {
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

  static getOwnerWallets = async () => {
    const methodName = 'getOwnerWallets';
    const params = {};
    try {
      const { user } = store.getState().user;

      if (!user?.wallets?.length) return [];

      const wallets = await request("/wallets", {
        method: "GET",
        queryConstraints: [where(documentId(), "in", user.wallets), limit(10)],
      });

      // Filter wallets where user is owner
      const ownerWallets = wallets.filter(wallet => wallet.owner === user.uid);
      ownerWallets.sort((a, b) => a?.walletName.localeCompare(b?.walletName));

      return ownerWallets;
    } catch (error) {
      console.error(`[WalletServices.${methodName}] Error:`, {
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

  static getJoinedWallets = async () => {
    const methodName = 'getJoinedWallets';
    const params = {};
    try {
      const { user } = store.getState().user;

      if (!user?.wallets?.length) return [];

      const wallets = await request("/wallets", {
        method: "GET",
        queryConstraints: [where(documentId(), "in", user.wallets), limit(10)],
      });

      // Filter wallets where user is member (not owner)
      const joinedWallets = wallets.filter(wallet => wallet.owner !== user.uid);
      joinedWallets.sort((a, b) => a?.walletName.localeCompare(b?.walletName));

      return joinedWallets;
    } catch (error) {
      console.error(`[WalletServices.${methodName}] Error:`, {
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

  static getDetail = async (walletID) => {
    const methodName = 'getDetail';
    const params = { walletID };
    try {
      const wallet = await request(`/wallets`, {
        method: "GET",
        uid: walletID,
      });

      return wallet;
    } catch (error) {
      console.error(`[WalletServices.${methodName}] Error:`, {
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

  static updateWallet = async (walletID, walletData) => {
    const methodName = 'updateWallet';
    const params = { 
      walletID, 
      walletData: { walletName: walletData?.walletName },
    };
    try {
      await request(`/wallets`, {
        method: "PATCH",
        uid: walletID,
        data: { ...walletData, updatedAt: Timestamp.now() },
      });
    } catch (error) {
      console.error(`[WalletServices.${methodName}] Error:`, {
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

  static getMembers = async (walletID) => {
    const methodName = 'getMembers';
    const params = { walletID };
    try {
      const members = await request(`/wallets/${walletID}/members`, {
        method: "GET",
      });

      return members;
    } catch (error) {
      console.error(`[WalletServices.${methodName}] Error:`, {
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

  static searchMember = async (email) => {
    const methodName = 'searchMember';
    const params = { email };
    try {
      const users = await request("/users", {
        method: "GET",
        queryConstraints: [where("email", ">=", email), where("email", "<=", email + "\uf8ff"), limit(10)],
      });

      return users;
    } catch (error) {
      console.error(`[WalletServices.${methodName}] Error:`, {
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

  static addMember = async (walletID, memberID) => {
    const methodName = 'addMember';
    const params = { walletID, memberID };
    try {
      const memberPermissions = {
        tracker: true,
      };

      await request(`/wallets/${walletID}/members`, {
        method: "PUT",
        uid: memberID,
        data: {
          permissions: memberPermissions,
          joinedAt: Timestamp.now(),
        },
      });

      // Update wallet members array
      const walletDetail = await WalletServices.getDetail(walletID);
      await request(`/wallets`, {
        method: "PATCH",
        uid: walletID,
        data: {
          members: [...(walletDetail.members || []), memberID],
        },
      });

      // Add wallet to member's wallets
      const memberUser = await request("/users", {
        method: "GET",
        uid: memberID,
      });

      await request("/users", {
        method: "PATCH",
        uid: memberID,
        data: {
          wallets: [...(memberUser?.wallets || []), walletID],
        },
      });
    } catch (error) {
      console.error(`[WalletServices.${methodName}] Error:`, {
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

  static removeMember = async (walletID, memberID) => {
    const methodName = 'removeMember';
    const params = { walletID, memberID };
    try {
      await request(`/wallets/${walletID}/members`, {
        method: "DELETE",
        uid: memberID,
      });

      // Update wallet members array
      const walletDetail = await WalletServices.getDetail(walletID);
      await request(`/wallets`, {
        method: "PATCH",
        uid: walletID,
        data: {
          members: walletDetail.members.filter((uid) => uid !== memberID),
        },
      });

      // Remove wallet from member's wallets
      const memberUser = await request("/users", {
        method: "GET",
        uid: memberID,
      });

      await request("/users", {
        method: "PATCH",
        uid: memberID,
        data: {
          wallets: memberUser?.wallets?.filter((wallet) => wallet !== walletID) || [],
        },
      });
    } catch (error) {
      console.error(`[WalletServices.${methodName}] Error:`, {
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

  static addGroupToWallet = async (walletID, groupID) => {
    const methodName = 'addGroupToWallet';
    const params = { walletID, groupID };
    try {
      const walletDetail = await WalletServices.getDetail(walletID);
      await request(`/wallets`, {
        method: "PATCH",
        uid: walletID,
        data: {
          groups: [...(walletDetail.groups || []), groupID],
        },
      });
    } catch (error) {
      console.error(`[WalletServices.${methodName}] Error:`, {
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

export default WalletServices;
