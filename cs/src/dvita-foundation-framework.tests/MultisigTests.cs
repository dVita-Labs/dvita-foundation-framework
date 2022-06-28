using Microsoft.VisualStudio.TestTools.UnitTesting;
using Neo;
using Neo.Wallets;
using Neo.Network.RPC;
using System;
using System.Threading.Tasks;
using Neo.VM;
using Neo.Network.P2P.Payloads;
using Neo.SmartContract;
using System.Numerics;
using System.Linq;
using Neo.VM.Types;

namespace DvitaFoundationFramework.tests
{
    [TestClass]
    public class MultisigTests
    {
        string wifFrom = "KzoToapKJze1sFUsGvPC5Rv4t2Um9DnrwWUe6T59DebZF2rDqdH1";

        [TestMethod]
        public async Task CreateMultisigAndSendDvg()
        {
            var tokenToTransfer = Client.DvgHash;
            var tokenHashAsUint = UInt160.Parse(tokenToTransfer);
            var transferAmount = new BigInteger(100_000_000); //1 DVG

            var key1 = Neo.Network.RPC.Utility.GetKeyPair(wifFrom);
            var key2 = DvitaWallet.GenerateNewKey();
            var key3 = DvitaWallet.GenerateNewKey();
            var multisigKeys = new Neo.Cryptography.ECC.ECPoint[] {key1.PublicKey, key2.PublicKey, key3.PublicKey};
            var multiContract = Contract.CreateMultiSigContract(2, multisigKeys);
            var multiAccount = multiContract.Script.ToScriptHash();

            //Transfer to multisig
            var txTo = await Client.WalletAPI.TransferAsync(tokenHashAsUint, key1, multiAccount, transferAmount * 2);
            await Client.WalletAPI.WaitTransactionAsync(txTo);

            var receiver = Contract.CreateSignatureContract(key1.PublicKey).ScriptHash;
            var balanceReceiver = await Client.WalletAPI.GetTokenBalanceAsync(tokenToTransfer, receiver.ToString());

            //Transfer from multisig
            var tx = await Client.Nep17API.CreateTransferTxAsync(tokenHashAsUint, 2, multisigKeys, new[] { key2, key1 }, receiver, transferAmount);
            await Client.RpcClient.SendRawTransactionAsync(tx);
            var txState = await Client.WalletAPI.WaitTransactionAsync(tx);

            var receiverBalanceShouldBe = balanceReceiver + transferAmount;
            var receiverNewBalance = await Client.WalletAPI.GetTokenBalanceAsync(tokenToTransfer, receiver.ToString());
            Assert.AreEqual(receiverBalanceShouldBe, receiverNewBalance);
        }
    }
}