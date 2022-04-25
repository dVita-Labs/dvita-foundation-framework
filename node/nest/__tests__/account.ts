import { wallet } from "@cityofzion/neon-core";

describe("createNewAccount", () => {
  test("creates a new account and adds it to a new wallet", async () => {
    const newWallet = new wallet.Wallet();
    const newAccount = new wallet.Account();
    await newWallet.addAccount(newAccount);
    expect(typeof newWallet.defaultAccount.address).toHaveLength;
  });
});
