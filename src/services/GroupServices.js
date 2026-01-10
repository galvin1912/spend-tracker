import { Timestamp, where, documentId, limit } from "firebase/firestore";
import { request } from "../utils/requestUtil";
import store from "../store";

class GroupServices {
  static createGroup = async (groupData) => {
    const { user } = store.getState().user;
    const { walletID, ...restGroupData } = groupData;

    if (!walletID) {
      throw new Error("walletID is required");
    }

    const newGroup = {
      ...restGroupData,
      walletID,
      owner: user?.uid,
      budget: null,
      createdAt: Timestamp.now(),
      updatedAt: null,
    };

    // Create group
    const groupRef = await request("/groups", {
      method: "POST",
      data: newGroup,
    });

    // Add group to user's groups (for backward compatibility)
    await request("/users", {
      method: "PATCH",
      uid: user?.uid,
      data: {
        groups: [...(user?.groups || []), groupRef.id],
      },
    });

    // Add group to wallet
    const WalletServices = (await import("./WalletServices")).default;
    await WalletServices.addGroupToWallet(walletID, groupRef.id);

    // Create tracker for group
    await request("/trackers", {
      method: "PUT",
      uid: groupRef.id,
      data: {
        categories: [],
        transactions: [],
        createdAt: Timestamp.now(),
        updatedAt: null,
      },
    });

    return groupRef.id;
  };

  static getOwnerGroups = async () => {
    const { user } = store.getState().user;

    if (!user?.groups?.length) return [];

    const groups = await request("/groups", {
      method: "GET",
      queryConstraints: [where(documentId(), "in", user.groups), limit(10)],
    });

    groups.sort((a, b) => a?.groupName.localeCompare(b?.groupName));

    return groups;
  };

  static getJoinedGroups = async () => {
    const { user } = store.getState().user;

    // Get groups where user is a member of the wallet
    if (!user?.wallets?.length) return [];

    const WalletServices = (await import("./WalletServices")).default;
    const wallets = await WalletServices.getWallets();
    
    // Get all groups from wallets where user is a member
    const groupIDs = new Set();
    wallets.forEach(wallet => {
      if (wallet.groups) {
        wallet.groups.forEach(groupID => groupIDs.add(groupID));
      }
    });

    if (groupIDs.size === 0) return [];

    const groups = await request("/groups", {
      method: "GET",
      queryConstraints: [where(documentId(), "in", Array.from(groupIDs)), limit(10)],
    });

    // Filter out groups owned by user (those are in ownerGroups)
    const ownerGroupIDs = new Set(user.groups || []);
    const joinedGroups = groups.filter(group => !ownerGroupIDs.has(group.uid));

    joinedGroups.sort((a, b) => a?.groupName.localeCompare(b?.groupName));

    return joinedGroups;
  };

  static getDetail = async (groupID) => {
    const group = await request(`/groups`, {
      method: "GET",
      uid: groupID,
    });

    return group;
  };

  static updateGroup = async (groupID, groupData) => {
    await request(`/groups`, {
      method: "PATCH",
      uid: groupID,
      data: { ...groupData, updatedAt: Timestamp.now() },
    });
  };

}

export default GroupServices;
