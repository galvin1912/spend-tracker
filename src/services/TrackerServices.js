import store from "../store";
import { where, orderBy, Timestamp } from "firebase/firestore";
import { request } from "../utils/requestUtil";

class TrackerServices {
  static getTrackers = async () => {
    const methodName = 'getTrackers';
    try {
      // Get wallets where user is owner or member
      const WalletServices = (await import("./WalletServices")).default;
      const wallets = await WalletServices.getWallets();

      if (wallets.length === 0) return [];

      // Get groups for each wallet
      const walletsWithGroups = await Promise.all(
        wallets.map(async (wallet) => {
          if (!wallet.groups || wallet.groups.length === 0) {
            return {
              walletID: wallet.uid,
              walletName: wallet.walletName,
              walletOwner: wallet.owner,
              groups: [],
            };
          }

          const groupPromises = wallet.groups.map(async (groupId) => {
            try {
              const group = await request("/groups", {
                method: "GET",
                uid: groupId,
              });
              return { success: true, groupId, group };
            } catch (groupError) {
              return { success: false, groupId, error: groupError };
            }
          });
          
          const groupResults = await Promise.all(groupPromises);
          const accessibleGroups = groupResults
            .filter((result) => result.success)
            .map((result) => result.group);

          return {
            walletID: wallet.uid,
            walletName: wallet.walletName,
            walletOwner: wallet.owner,
            groups: accessibleGroups.sort((a, b) => a.groupName.localeCompare(b.groupName)),
          };
        })
      );

      return walletsWithGroups;
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
        method: methodName,
        params: {},
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

  static deleteTracker = async (trackerID) => {
    const methodName = 'deleteTracker';
    const params = { trackerID };
    try {
      const trackerDetail = await this.getDetail(trackerID);
      const deleteOperations = [];

      const deleteSubcollection = (collectionName, ids) => {
        if (ids?.length) {
          deleteOperations.push(
            ...ids.map((id) =>
              request(`/trackers/${trackerID}/${collectionName}`, {
                method: "DELETE",
                uid: id,
              })
            )
          );
        }
      };

      deleteSubcollection("categories", trackerDetail.categories);
      deleteSubcollection("transactions", trackerDetail.transactions);

      await Promise.all(deleteOperations);
      await request(`/trackers`, { method: "DELETE", uid: trackerID });
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static createTransaction = async (trackerID, transactionData) => {
    const methodName = 'createTransaction';
    const params = { 
      trackerID, 
      transactionData: {
        ...transactionData,
        // Sanitize: don't log full transactionData, just key fields
        type: transactionData.type,
        amount: transactionData.amount,
        category: transactionData.category,
      }
    };
    try {
      const {
        user: { uid },
      } = store.getState().user;

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

      await this.updateTrackerCollection(trackerID, "transactions", transactionRef.id);
      return transactionRef;
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static updateTrackerCollection = async (trackerID, collectionName, newID) => {
    const methodName = 'updateTrackerCollection';
    const params = { trackerID, collectionName, newID };
    try {
      const trackerDetail = await this.getDetail(trackerID);
      await request(`/trackers`, {
        method: "PATCH",
        uid: trackerID,
        data: { [collectionName]: [...(trackerDetail[collectionName] || []), newID] },
      });
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static getDetail = async (trackerID) => {
    const methodName = 'getDetail';
    const params = { trackerID };
    try {
      const trackerDetail = await request(`/trackers`, {
        method: "GET",
        uid: trackerID,
      });

      return trackerDetail;
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static getCategories = async (trackerID) => {
    const methodName = 'getCategories';
    const params = { trackerID };
    try {
      const categories = await request(`/trackers/${trackerID}/categories`, {
        method: "GET",
      });

      categories.sort((a, b) => a.name.localeCompare(b.name));

      return categories;
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static getCategoryDetail = async (trackerID, categoryID) => {
    const methodName = 'getCategoryDetail';
    const params = { trackerID, categoryID };
    try {
      const categoryDetail = await request(`/trackers/${trackerID}/categories`, {
        method: "GET",
        uid: categoryID,
      });

      return categoryDetail;
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static updateCategory = async (trackerID, categoryID, categoryData) => {
    const methodName = 'updateCategory';
    const params = { trackerID, categoryID, categoryData };
    try {
      await request(`/trackers/${trackerID}/categories`, {
        method: "PATCH",
        uid: categoryID,
        data: categoryData,
      });
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static createCategory = async (trackerID, categoryData) => {
    const methodName = 'createCategory';
    const params = { trackerID, categoryData };
    try {
      const res = await request(`/trackers/${trackerID}/categories`, {
        method: "POST",
        data: categoryData,
      });
      return res;
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static deleteCategory = async (trackerID, categoryID) => {
    const methodName = 'deleteCategory';
    const params = { trackerID, categoryID };
    try {
      // Find all transactions that belong to this category
      const transactions = await request(`/trackers/${trackerID}/transactions`, {
        method: "GET",
        queryConstraints: [where("category", "==", categoryID)],
      });

      // Update all transactions to set category to "uncategorized"
      if (transactions.length > 0) {
        await Promise.all(
          transactions.map((transaction) =>
            request(`/trackers/${trackerID}/transactions`, {
              method: "PATCH",
              uid: transaction.uid,
              data: { category: "uncategorized", updatedAt: Timestamp.now() },
            })
          )
        );
      }

      // Delete the category document
      await request(`/trackers/${trackerID}/categories`, {
        method: "DELETE",
        uid: categoryID,
      });

      // Update tracker document to remove categoryID from categories array
      const trackerDetail = await this.getDetail(trackerID);
      if (trackerDetail.categories && trackerDetail.categories.includes(categoryID)) {
        await request(`/trackers`, {
          method: "PATCH",
          uid: trackerID,
          data: {
            categories: trackerDetail.categories.filter((id) => id !== categoryID),
          },
        });
      }
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static updateTransaction = async (trackerID, transactionID, transactionData) => {
    const methodName = 'updateTransaction';
    const params = { 
      trackerID, 
      transactionID,
      transactionData: {
        type: transactionData.type,
        amount: transactionData.amount,
        category: transactionData.category,
      }
    };
    try {
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
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static deleteTransaction = async (trackerID, transactionID) => {
    const methodName = 'deleteTransaction';
    const params = { trackerID, transactionID };
    try {
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
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static getTransactions = async (trackerID, filter) => {
    const methodName = 'getTransactions';
    const params = { 
      trackerID, 
      filter: {
        type: filter.type,
        timeType: filter.timeType,
        sortBy: filter.sortBy,
        categories: filter.categories ? (Array.isArray(filter.categories) ? filter.categories.length : 'string') : null,
      }
    };
    try {
      let queryConstraints = [];

      // Firestore requires: equality filters first, then range filters, then orderBy

      // Filter by type - equality filter (must come before range filters)
      if (filter.type !== "all") {
        queryConstraints.push(where("type", "==", filter.type));
      }

      // Filter by categories - equality filter with 'in' operator (must come before range filters)
      // Handle both string (comma-separated) and array formats
      let categoryArray = [];
      if (filter.categories) {
        if (typeof filter.categories === "string") {
          categoryArray = filter.categories.split(",").filter((cat) => cat.trim());
        } else if (Array.isArray(filter.categories)) {
          categoryArray = filter.categories;
        }
      }

      if (categoryArray.length > 0) {
        // Firestore 'in' operator supports up to 10 values
        if (categoryArray.length <= 10) {
          queryConstraints.push(where("category", "in", categoryArray));
        }
        // If > 10 categories, we'll filter client-side as fallback
      }

      // Handle date filtering - range filters (must come after equality filters)
      if (filter.timeType === "custom" && filter.timeRange) {
        // Custom date range filtering
        queryConstraints.push(
          where("time", ">=", Timestamp.fromDate(filter.timeRange.startDate.startOf("day").toDate())),
          where("time", "<=", Timestamp.fromDate(filter.timeRange.endDate.endOf("day").toDate()))
        );
      } else if (filter.timeType === "week") {
        // Week filtering (Monday to Sunday)
        queryConstraints.push(
          where("time", ">=", Timestamp.fromDate(filter.time.startOf("week").toDate())),
          where("time", "<=", Timestamp.fromDate(filter.time.endOf("week").toDate()))
        );
      } else {
        // Standard month filtering
        queryConstraints.push(
          where("time", ">=", Timestamp.fromDate(filter.time.startOf("month").toDate())),
          where("time", "<=", Timestamp.fromDate(filter.time.endOf("month").toDate()))
        );
      }

      // Determine sort order - orderBy must come last
      // If sorting by amount, use amount orderBy; otherwise use time
      if (filter.sortBy === "amount") {
        queryConstraints.push(orderBy("amount", "desc"));
      } else {
        queryConstraints.push(orderBy("time", "desc"));
      }

      let transactions = await request(`/trackers/${trackerID}/transactions`, {
        method: "GET",
        queryConstraints,
      });

      // Fallback: filter by categories client-side if > 10 categories
      if (categoryArray.length > 10) {
        transactions = transactions.filter((transaction) => categoryArray.includes(transaction.category));
      }

      // Fallback: filter by type client-side if not already filtered (shouldn't happen, but safety check)
      if (filter.type === "all") {
        // No filtering needed
      }

      // Fallback: sort by amount client-side if sortBy is amount but orderBy failed
      // (This shouldn't happen if index exists, but provides fallback)
      if (filter.sortBy === "amount") {
        // Already sorted by Firestore, but verify
        transactions.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
      }

      return transactions;
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static getTransactionDetail = async (trackerID, transactionID) => {
    const methodName = 'getTransactionDetail';
    const params = { trackerID, transactionID };
    try {
      const transactionDetail = await request(`/trackers/${trackerID}/transactions`, {
        method: "GET",
        uid: transactionID,
      });

      return transactionDetail;
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

  static getTransactionsSum = async (trackerID, filter) => {
    const methodName = 'getTransactionsSum';
    const params = { 
      trackerID, 
      filter: {
        type: filter.type,
        timeType: filter.timeType,
        category: filter.category,
      }
    };
    try {
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
    } catch (error) {
      console.error(`[TrackerServices.${methodName}] Error:`, {
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

export default TrackerServices;
