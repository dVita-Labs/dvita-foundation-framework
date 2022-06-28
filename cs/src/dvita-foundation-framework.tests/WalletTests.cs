using Microsoft.VisualStudio.TestTools.UnitTesting;
using Neo;
using Neo.Wallets;
using Neo.Wallets.NEP6;
using System.Security.Cryptography;
using Neo.Network.RPC;
using System;
using System.Threading.Tasks;
using Neo.VM;
using Neo.Network.P2P.Payloads;
using Neo.SmartContract;

namespace DvitaFoundationFramework.tests
{
    [TestClass]
    public class WalletTests
    {
        string path = "wallet.json"; 
        string password = "pass";
        string wifFrom = "KzoToapKJze1sFUsGvPC5Rv4t2Um9DnrwWUe6T59DebZF2rDqdH1";

        [TestMethod]
        public void CreateNewWallet()
        {
            var walletAccount = DvitaWallet.CreateWallet(path, password);
            Assert.IsNotNull(walletAccount);
        }

        [TestMethod]
        public void ImportToWallet()
        {
            var newWallet = new NEP6Wallet(path, password, Client.Settings);
            newWallet.Import(wifFrom);
            newWallet.Save();
            var accountsInWallet = newWallet.GetAccounts();
            Assert.IsNotNull(accountsInWallet);
        }

        [TestMethod]
        public async Task ImportWalletAndSendDvg()
        {
            var tokenToTransfer = Client.DvgHash;
            var tokenHashAsUint = UInt160.Parse(tokenToTransfer);
            var transferAmount = 200_000_000; //2 DVG

            var walletAccountTo = DvitaWallet.CreateWallet(path, password);
            var receiverKey = walletAccountTo.GetKey();
            var sendKey = Neo.Network.RPC.Utility.GetKeyPair(wifFrom);

            var balanceReceiver = await Client.WalletAPI.GetTokenBalanceAsync(tokenToTransfer, receiverKey.PublicKey.ToString());

            var tx = await Client.WalletAPI.TransferAsync(tokenHashAsUint, sendKey, receiverKey.PublicKeyHash, transferAmount); 
            var txState = await Client.WalletAPI.WaitTransactionAsync(tx);

            var receiverBalanceShouldBe = balanceReceiver + transferAmount;
            var receiverNewBalance = await Client.WalletAPI.GetTokenBalanceAsync(tokenToTransfer, receiverKey.PublicKeyHash.ToString());
            Assert.AreEqual(receiverBalanceShouldBe, receiverNewBalance);
        }
    }
}