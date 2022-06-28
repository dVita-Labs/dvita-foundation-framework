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
    public class ContractTests
    {
        string wif = "KzoToapKJze1sFUsGvPC5Rv4t2Um9DnrwWUe6T59DebZF2rDqdH1";
        string customContractHash = "0x94054eae1f6b86e9dde12cab77f7afdff87f7277";

        [TestMethod]
        public async Task IvokeCustomSmartContract()
        {
            var tokenToTransfer = customContractHash;
            var tokenHashAsUint = UInt160.Parse(tokenToTransfer);
            var key = Neo.Network.RPC.Utility.GetKeyPair(wif);
            var sender = Contract.CreateSignatureContract(key.PublicKey).ScriptHash;

            var script = tokenHashAsUint.MakeScript("mint", sender, 10);
            var cosigners = new[] { new Signer { Scopes = WitnessScope.CalledByEntry, Account = sender } };
            var txManager = await new TransactionManagerFactory(Client.RpcClient).MakeTransactionAsync(script, cosigners);
            var tx = await txManager.AddSignature(key).SignAsync();
            await Client.RpcClient.SendRawTransactionAsync(tx);
            var txState = await Client.WalletAPI.WaitTransactionAsync(tx);
            Assert.IsNotNull(txState.Transaction.Hash);
        }
    }
}