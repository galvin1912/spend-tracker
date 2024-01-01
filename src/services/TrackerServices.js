import store from "../store";
import { where, or, orderBy, Timestamp } from "firebase/firestore";
import { request } from "../utils/requestUtil";
import dayjs from "dayjs";

class TrackerServices {
  static getTrackers = async () => {
    const { user } = store.getState().user;

    // get all groups that user is owner or member
    let groups = await request("/groups", {
      method: "GET",
      queryConstraints: [or(where("owner", "==", user?.uid), where("members", "array-contains", user?.uid))],
    });

    // loop through groups result, if user is owner, skip, else user is member, check permission, if tracker is true, keep it, else skip
    groups = await Promise.all(
      groups.map(async (group) => {
        if (group?.owner === user?.uid) return group;

        const member = await request(`/groups/${group.uid}/members`, {
          method: "GET",
          uid: user?.uid,
        });

        if (member?.permissions?.tracker) return group;

        return null;
      })
    );

    // filter null group
    groups = groups.filter((group) => group);

    // instead of return array of groups, we return array of group of groups by owner, example [{owner: "uid", groups: [{}, {}]}]
    groups = groups?.reduce((acc, group) => {
      const owner = group?.owner;
      const groupByOwner = acc?.find((item) => item?.owner === owner);
      if (groupByOwner) {
        groupByOwner.groups?.push(group);
      } else {
        acc?.push({ owner, groups: [group] });
      }
      return acc;
    }, []);

    // sort groups by owner (priority: owner is current user)
    groups.sort((a, b) => {
      if (a.owner === user?.uid) return -1;
      if (b.owner === user?.uid) return 1;
      return 0;
    });

    // sort by group name
    groups.forEach((item) => {
      item.groups.sort((a, b) => a.groupName.localeCompare(b.groupName));
    });

    return groups;
  };

  static getDetail = async (trackerID) => {
    const trackerDetail = await request(`/trackers`, {
      method: "GET",
      uid: trackerID,
    });

    return trackerDetail;
  };

  static deleteTracker = async (trackerID) => {
    const trackerDetail = await TrackerServices.getDetail(trackerID);

    // remove categories
    if (trackerDetail?.categories && trackerDetail?.categories.length) {
      let removeCategoryPromises = [];

      trackerDetail.categories.forEach((categoryID) => {
        removeCategoryPromises.push(
          request(`/trackers/${trackerID}/categories`, {
            method: "DELETE",
            uid: categoryID,
          })
        );
      });

      await Promise.all(removeCategoryPromises);
    }

    // remove transactions
    if (trackerDetail?.transactions && trackerDetail?.transactions.length) {
      let removeTransactionPromises = [];

      trackerDetail.transactions.forEach((transactionID) => {
        removeTransactionPromises.push(
          request(`/trackers/${trackerID}/transactions`, {
            method: "DELETE",
            uid: transactionID,
          })
        );
      });

      await Promise.all(removeTransactionPromises);
    }

    // remove tracker
    await request(`/trackers`, {
      method: "DELETE",
      uid: trackerID,
    });
  };

  static createCategory = async (trackerID, categoryData) => {
    const categoryRef = await request(`/trackers/${trackerID}/categories`, {
      method: "POST",
      data: categoryData,
    });

    const trackerDetail = await TrackerServices.getDetail(trackerID);

    await request(`/trackers`, {
      method: "PATCH",
      uid: trackerID,
      data: {
        categories: [...(trackerDetail.categories || []), categoryRef.id],
      },
    });
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

  static createTransaction = async (trackerID, transactionData) => {
    const { user } = store.getState().user;

    const newTransaction = {
      ...transactionData,
      owner: user?.uid,
      time: Timestamp.fromDate(transactionData.time.toDate()),
      amount: Number(transactionData.amount) * (transactionData.type === "expense" ? -1 : 1),
      createdAt: Timestamp.now(),
      updatedAt: null,
    };

    const transactionRef = await request(`/trackers/${trackerID}/transactions`, {
      method: "POST",
      data: newTransaction,
    });

    const trackerDetail = await TrackerServices.getDetail(trackerID);

    await request(`/trackers`, {
      method: "PATCH",
      uid: trackerID,
      data: {
        transactions: [...(trackerDetail.transactions || []), transactionRef.id],
      },
    });
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
  }

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
    let transactions = await request(`/trackers/${trackerID}/transactions`, {
      method: "GET",
      queryConstraints: [
        where("time", ">=", Timestamp.fromDate(filter.time.startOf("month").toDate())),
        where("time", "<=", Timestamp.fromDate(filter.time.endOf("month").toDate())),
        orderBy("time", "desc"),
      ],
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
  }

  static getTransactionsTodayExpenseSum = async (trackerID) => {
    const today = dayjs();

    const sum = await request(`/trackers/${trackerID}/transactions`, {
      method: "GET_SUM",
      queryConstraints: [
        where("time", ">=", Timestamp.fromDate(today.startOf("day").toDate())),
        where("time", "<=", Timestamp.fromDate(today.endOf("day").toDate())),
        where("type", "==", "expense"),
      ],
      field: "amount",
    });

    return sum;
  };

  static getTransactionsMonthSum = async (trackerID, filter) => {
    const queryConstraints = [
      where("time", ">=", Timestamp.fromDate(filter.time.startOf("month").toDate())),
      where("time", "<=", Timestamp.fromDate(filter.time.endOf("month").toDate())),
    ];

    if (filter.category) {
      queryConstraints.push(where("category", "==", filter.category));
    }

    queryConstraints.push(where("type", "==", filter.type));

    const sum = await request(`/trackers/${trackerID}/transactions`, {
      method: "GET_SUM",
      queryConstraints,
      field: "amount",
    });

    return sum;
  };
}

export default TrackerServices;
