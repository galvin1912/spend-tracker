import store from "../store";
import { where, or, orderBy, Timestamp } from "firebase/firestore";
import { request } from "../utils/requestUtil";

class TrackerServices {
  static getTrackers = async () => {
    const { user: { uid } } = store.getState().user;
    
    const groups = await request("/groups", {
      method: "GET",
      queryConstraints: [or(
        where("owner", "==", uid),
        where("members", "array-contains", uid)
      )],
    });

    const processedGroups = await Promise.all(groups.map(async group => {
      if (group.owner === uid) return group;
      
      const member = await request(`/groups/${group.uid}/members`, {
        method: "GET",
        uid,
      });

      return member?.permissions?.tracker ? group : null;
    }));

    const grouped = processedGroups
      .filter(Boolean)
      .reduce((acc, group) => {
        const ownerGroups = acc.find(g => g.owner === group.owner)?.groups || [];
        return [
          ...acc.filter(g => g.owner !== group.owner),
          { owner: group.owner, groups: [...ownerGroups, group] }
        ];
      }, [])
      .sort((a, b) => (a.owner === uid ? -1 : b.owner === uid ? 1 : 0));

    return grouped.map(group => ({
      ...group,
      groups: group.groups.sort((a, b) => a.groupName.localeCompare(b.groupName))
    }));
  };

  static deleteTracker = async trackerID => {
    const trackerDetail = await this.getDetail(trackerID);
    const deleteOperations = [];

    const deleteSubcollection = (collectionName, ids) => {
      if (ids?.length) {
        deleteOperations.push(...ids.map(id =>
          request(`/trackers/${trackerID}/${collectionName}`, {
            method: "DELETE",
            uid: id,
          })
        ));
      }
    };

    deleteSubcollection('categories', trackerDetail.categories);
    deleteSubcollection('transactions', trackerDetail.transactions);
    
    await Promise.all(deleteOperations);
    await request(`/trackers`, { method: "DELETE", uid: trackerID });
  };

  static createTransaction = async (trackerID, transactionData) => {
    const { user: { uid } } = store.getState().user;
    
    const newTransaction = {
      ...transactionData,
      owner: uid,
      time: Timestamp.fromDate(transactionData.time.toDate()),
      amount: Number(transactionData.amount) * (transactionData.type === "expense" ? -1 : 1),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const transactionRef = await request(`/trackers/${trackerID}/transactions`, {
      method: "POST",
      data: newTransaction,
    });

    await this.updateTrackerCollection(trackerID, 'transactions', transactionRef.id);
    return transactionRef;
  };

  static updateTrackerCollection = async (trackerID, collectionName, newID) => {
    const trackerDetail = await this.getDetail(trackerID);
    await request(`/trackers`, {
      method: "PATCH",
      uid: trackerID,
      data: { [collectionName]: [...(trackerDetail[collectionName] || []), newID] },
    });
  };

  static getDetail = async (trackerID) => {
    const trackerDetail = await request(`/trackers`, {
      method: "GET",
      uid: trackerID,
    });

    return trackerDetail;
  };

  static getCategories = async (trackerID) => {
    const categories = await request(`/trackers/${trackerID}/categories`, {
      method: "GET",
    });

    categories.sort((a, b) => a.name.localeCompare(b.name));

    return categories;
  };

  static getCategoryDetail = async (trackerID, categoryID) => {
    const categoryDetail = await request(`/trackers/${trackerID}/categories`, {
      method: "GET",
      uid: categoryID,
    });

    return categoryDetail;
  };

  static updateCategory = async (trackerID, categoryID, categoryData) => {
    await request(`/trackers/${trackerID}/categories`, {
      method: "PATCH",
      uid: categoryID,
      data: categoryData,
    });
  };

  static createCategory = async (trackerID, categoryData) => {
    const res = await request(`/trackers/${trackerID}/categories`, {
      method: "POST",
      data: categoryData,
    });
    return res;
  };

  static updateTransaction = async (trackerID, transactionID, transactionData) => {
    const updateTransaction = {
      ...transactionData,
      time: Timestamp.fromDate(transactionData.time.toDate()),
      amount: Number(transactionData.amount) * (transactionData.type === "expense" ? -1 : 1),
      updatedAt: Timestamp.now(),
    };

    await request(`/trackers/${trackerID}/transactions`, {
      method: "PATCH",
      uid: transactionID,
      data: updateTransaction,
    });
  };

  static deleteTransaction = async (trackerID, transactionID) => {
    await request(`/trackers/${trackerID}/transactions`, {
      method: "DELETE",
      uid: transactionID,
    });

    const trackerDetail = await TrackerServices.getDetail(trackerID);

    await request(`/trackers`, {
      method: "PATCH",
      uid: trackerID,
      data: {
        transactions: trackerDetail.transactions.filter((transaction) => transaction !== transactionID),
      },
    });
  };

  static getTransactions = async (trackerID, filter) => {
    let queryConstraints = [];

    // Handle date filtering based on filter type
    if (filter.timeType === "custom" && filter.timeRange) {
      // Custom date range filtering
      queryConstraints = [
        where("time", ">=", Timestamp.fromDate(filter.timeRange.startDate.startOf("day").toDate())),
        where("time", "<=", Timestamp.fromDate(filter.timeRange.endDate.endOf("day").toDate())),
        orderBy("time", "desc"),
      ];
    } else if (filter.timeType === "week") {
      // Week filtering (Monday to Sunday)
      queryConstraints = [
        where("time", ">=", Timestamp.fromDate(filter.time.startOf("week").toDate())),
        where("time", "<=", Timestamp.fromDate(filter.time.endOf("week").toDate())),
        orderBy("time", "desc"),
      ];
    } else {
      // Standard month filtering
      queryConstraints = [
        where("time", ">=", Timestamp.fromDate(filter.time.startOf("month").toDate())),
        where("time", "<=", Timestamp.fromDate(filter.time.endOf("month").toDate())),
        orderBy("time", "desc"),
      ];
    }

    let transactions = await request(`/trackers/${trackerID}/transactions`, {
      method: "GET",
      queryConstraints,
    });

    // filter by type
    if (filter.type !== "all") {
      transactions = transactions.filter((transaction) => transaction.type === filter.type);
    }

    // filter by sortBy
    if (filter.sortBy === "amount") {
      transactions.sort((a, b) => a.amount - b.amount);
    }

    // filter by categories
    if (filter.categories) {
      transactions = transactions.filter((transaction) => filter.categories.includes(transaction.category));
    }

    return transactions;
  };

  static getTransactionDetail = async (trackerID, transactionID) => {
    const transactionDetail = await request(`/trackers/${trackerID}/transactions`, {
      method: "GET",
      uid: transactionID,
    });

    return transactionDetail;
  };

  static getTransactionsSum = async (trackerID, filter) => {
    let queryConstraints = [];

    // Handle date filtering
    if (filter.timeType === "custom" && filter.timeRange) {
      // Custom date range filtering
      queryConstraints.push(where("time", ">=", Timestamp.fromDate(filter.timeRange.startDate.startOf("day").toDate())));
      queryConstraints.push(where("time", "<=", Timestamp.fromDate(filter.timeRange.endDate.endOf("day").toDate())));
    } else if (filter.time && filter.timeType) {
      // Standard time period filtering (month, day, week, etc.)
      queryConstraints.push(where("time", ">=", Timestamp.fromDate(filter.time.startOf(filter.timeType).toDate())));
      queryConstraints.push(where("time", "<=", Timestamp.fromDate(filter.time.endOf(filter.timeType).toDate())));
    }

    if (filter.category) {
      queryConstraints.push(where("category", "==", filter.category));
    }

    if (filter.type !== "all") {
      queryConstraints.push(where("type", "==", filter.type));
    }

    const sum = await request(`/trackers/${trackerID}/transactions`, {
      method: "GET_SUM",
      queryConstraints,
      field: "amount",
    });

    return sum;
  };
}

export default TrackerServices;
