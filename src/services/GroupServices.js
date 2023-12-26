import { Timestamp, where, documentId, limit } from "firebase/firestore";
import { request } from "../utils/requestUtil";
import store from "../store";

class GroupServices {
  static createGroup = async (groupData) => {
    const { user } = store.getState().user;

    const newGroup = {
      ...groupData,
      createdAt: Timestamp.now(),
      updatedAt: null,
    };

    const groupRef = await request("groups", {
      method: "POST",
      data: newGroup,
    });

    await request("users", {
      method: "PATCH",
      uid: user?.uid,
      data: {
        groups: [...(user?.groups || []), groupRef.id],
      },
    });

    return groupRef.id;
  };

  static getOwnerGroups = async () => {
    const { user } = store.getState().user;

    if (!user?.groups?.length) return [];

    const groups = await request("groups", {
      method: "GET",
      queryConstraints: [where(documentId(), "in", user.groups), limit(10)],
    });

    return groups;
  };

  static getJoinedGroups = async () => {
    const { user } = store.getState().user;

    const groups = await request("groups", {
      method: "GET",
      queryConstraints: [where("members", "array-contains", user?.uid)],
    });

    return groups;
  };

  static getDetail = async (groupID) => {
    const group = await request(`groups`, {
      method: "GET",
      uid: groupID,
    });

    return group;
  };

  static updateGroup = async (groupID, groupData) => {
    await request(`groups`, {
      method: "PATCH",
      uid: groupID,
      data: { ...groupData, updatedAt: Timestamp.now() },
    });
  };

  static deleteGroup = async (groupID) => {
    // Remove all members
    const groupDetail = await GroupServices.getDetail(groupID);

    let removeMemberPromises = [];

    if (groupDetail?.members && groupDetail?.members.length) {
      groupDetail.members.forEach((uid) => {
        removeMemberPromises.push(GroupServices.removeMember(groupID, uid));
      });
    }

    await Promise.all(removeMemberPromises);

    // Remove group
    await request(`groups`, {
      method: "DELETE",
      uid: groupID,
    });

    // Remove group from user's groups
    const { user } = store.getState().user;

    await request("users", {
      method: "PATCH",
      uid: user?.uid,
      data: {
        groups: user?.groups.filter((group) => group !== groupID),
      },
    });
  };

  static getMembers = async (groupID) => {
    const members = await request(`groups/${groupID}/members`, {
      method: "GET",
    });

    return members;
  };

  static searchMember = async (email) => {
    const users = await request("users", {
      method: "GET",
      queryConstraints: [
        where("email", ">=", email),
        where("email", "<=", email + "\uf8ff"),
        limit(10),
      ],
    });

    return users;
  };

  static addMember = async (groupID, memberID) => {
    const memberPermissions = {
      spendTracker: true,
    };

    await request(`groups/${groupID}/members`, {
      method: "PUT",
      uid: memberID,
      data: {
        permissions: memberPermissions,
      },
    });
  };

  static removeMember = async (groupID, memberID) => {
    await request(`groups/${groupID}/members`, {
      method: "DELETE",
      uid: memberID,
    });
  };
}

export default GroupServices;
