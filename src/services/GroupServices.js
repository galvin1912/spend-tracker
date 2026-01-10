import { Timestamp, where, documentId, limit } from "firebase/firestore";
import { request } from "../utils/requestUtil";
import store from "../store";

class GroupServices {
  static createGroup = async (groupData) => {
    const methodName = 'createGroup';
    const params = { 
      groupData: { 
        walletID: groupData?.walletID,
        groupName: groupData?.groupName,
      }
    };
    try {
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
    } catch (error) {
      console.error(`[GroupServices.${methodName}] Error:`, {
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

  static getOwnerGroups = async () => {
    const methodName = 'getOwnerGroups';
    const params = {};
    try {
      const { user } = store.getState().user;

      if (!user?.groups?.length) return [];

      const groups = await request("/groups", {
        method: "GET",
        queryConstraints: [where(documentId(), "in", user.groups), limit(10)],
      });

      groups.sort((a, b) => a?.groupName.localeCompare(b?.groupName));

      return groups;
    } catch (error) {
      console.error(`[GroupServices.${methodName}] Error:`, {
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

  static getJoinedGroups = async () => {
    const methodName = 'getJoinedGroups';
    const params = {};
    try {
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
    } catch (error) {
      console.error(`[GroupServices.${methodName}] Error:`, {
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

  static getDetail = async (groupID) => {
    const methodName = 'getDetail';
    const params = { groupID };
    try {
      const group = await request(`/groups`, {
        method: "GET",
        uid: groupID,
      });

      return group;
    } catch (error) {
      console.error(`[GroupServices.${methodName}] Error:`, {
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

  static updateGroup = async (groupID, groupData) => {
    const methodName = 'updateGroup';
    const params = { 
      groupID, 
      groupData: { groupName: groupData?.groupName },
    };
    try {
      await request(`/groups`, {
        method: "PATCH",
        uid: groupID,
        data: { ...groupData, updatedAt: Timestamp.now() },
      });
    } catch (error) {
      console.error(`[GroupServices.${methodName}] Error:`, {
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

export default GroupServices;
