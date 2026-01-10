import WalletServices from "../../services/WalletServices";
import GroupServices from "../../services/GroupServices";

/**
 * Migration script to create default wallet for existing users
 * This should be called when user logs in for the first time after the update
 */
export const createDefaultWalletForUser = async (user) => {
  // Check if user already has wallets
  if (user?.wallets && user.wallets.length > 0) {
    return; // User already has wallets, skip migration
  }

  // Check if user has groups
  if (!user?.groups || user.groups.length === 0) {
    // User has no groups, just create an empty default wallet
    const walletID = await WalletServices.createWallet({
      walletName: "Ví mặc định",
      description: "Ví mặc định được tạo tự động",
    }, user.uid);
    return walletID;
  }

  // User has groups, create default wallet and assign all groups to it
  const walletID = await WalletServices.createWallet({
    walletName: "Ví mặc định",
    description: "Ví mặc định được tạo tự động",
  }, user.uid);

  // Get all groups owned by user
  const groups = await GroupServices.getOwnerGroups();

  // Update each group to include walletID and add to wallet
  const updatePromises = groups.map(async (group) => {
    try {
      await GroupServices.updateGroup(group.uid, {
        walletID: walletID,
      });
      await WalletServices.addGroupToWallet(walletID, group.uid);
    } catch (error) {
      console.error(`Failed to update group ${group.uid}:`, error);
    }
  });

  await Promise.all(updatePromises);

  return walletID;
};
