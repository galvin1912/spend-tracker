import { Timestamp, where, documentId, limit } from "firebase/firestore";
import { request } from "../utils/requestUtil";
import store from "../store";
import TrackerServices from "./TrackerServices";

class GroupServices {
  static createGroup = async (groupData) => {
    const { user } = store.getState().user;

    const newGroup = {
      ...groupData,
      owner: user?.uid,
      members: [],
      createdAt: Timestamp.now(),
      updatedAt: null,
    };

    // Create group
    const groupRef = await request("/groups", {
      method: "POST",
      data: newGroup,
    });

    // Add group to user's groups
    await request("/users", {
      method: "PATCH",
      uid: user?.uid,
      data: {
        groups: [...(user?.groups || []), groupRef.id],
      },
    });

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

    const groups = await request("/groups", {
      method: "GET",
      queryConstraints: [where("members", "array-contains", user?.uid)],
    });

    groups.sort((a, b) => a?.groupName.localeCompare(b?.groupName));

    return groups;
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

  static deleteGroup = async (groupID) => {
    // Remove tracker
    await TrackerServices.deleteTracker(groupID);

    // Remove all members
    const groupDetail = await GroupServices.getDetail(groupID);

    if (groupDetail?.members && groupDetail?.members.length) {
      let removeMemberPromises = [];

      groupDetail.members.forEach((uid) => {
        removeMemberPromises.push(GroupServices.removeMember(groupID, uid));
      });

      await Promise.all(removeMemberPromises);
    }

    // Remove group
    await request(`/groups`, {
      method: "DELETE",
      uid: groupID,
    });

    // Remove group from user's groups
    const { user } = store.getState().user;

    await request("/users", {
      method: "PATCH",
      uid: user?.uid,
      data: {
        groups: user?.groups.filter((group) => group !== groupID),
      },
    });
  };

  static getMembers = async (groupID) => {
    const members = await request(`/groups/${groupID}/members`, {
      method: "GET",
    });

    return members;
  };

  static searchMember = async (email) => {
    const users = await request("/users", {
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
      tracker: true,
    };

    await request(`/groups/${groupID}/members`, {
      method: "PUT",
      uid: memberID,
      data: {
        permissions: memberPermissions,
      },
    });
  };

  static removeMember = async (groupID, memberID) => {
    await request(`/groups/${groupID}/members`, {
      method: "DELETE",
      uid: memberID,
    });
  };
}

export default GroupServices;
