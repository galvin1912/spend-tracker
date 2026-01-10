import { Timestamp, where, documentId, limit } from "firebase/firestore";
import { request } from "../utils/requestUtil";
import store from "../store";

class WalletServices {
  static createWallet = async (walletData, ownerUID = null) => {
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
  };

  static getWallets = async () => {
    const { user } = store.getState().user;

    if (!user?.wallets?.length) return [];

    const wallets = await request("/wallets", {
      method: "GET",
      queryConstraints: [where(documentId(), "in", user.wallets), limit(10)],
    });

    wallets.sort((a, b) => a?.walletName.localeCompare(b?.walletName));

    return wallets;
  };

  static getOwnerWallets = async () => {
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
  };

  static getJoinedWallets = async () => {
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
  };

  static getDetail = async (walletID) => {
    const wallet = await request(`/wallets`, {
      method: "GET",
      uid: walletID,
    });

    return wallet;
  };

  static updateWallet = async (walletID, walletData) => {
    await request(`/wallets`, {
      method: "PATCH",
      uid: walletID,
      data: { ...walletData, updatedAt: Timestamp.now() },
    });
  };

  static getMembers = async (walletID) => {
    const members = await request(`/wallets/${walletID}/members`, {
      method: "GET",
    });

    return members;
  };

  static searchMember = async (email) => {
    const users = await request("/users", {
      method: "GET",
      queryConstraints: [where("email", ">=", email), where("email", "<=", email + "\uf8ff"), limit(10)],
    });

    return users;
  };

  static addMember = async (walletID, memberID) => {
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
  };

  static removeMember = async (walletID, memberID) => {
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
  };

  static addGroupToWallet = async (walletID, groupID) => {
    const walletDetail = await WalletServices.getDetail(walletID);
    await request(`/wallets`, {
      method: "PATCH",
      uid: walletID,
      data: {
        groups: [...(walletDetail.groups || []), groupID],
      },
    });
  };
}

export default WalletServices;
