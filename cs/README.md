How to perform Blockchain transactions
======================================

1. Create a new wallet and generate a new address
-------------------------------------------------

    var path = "wallet.json"; 
    var password = "pass";
    var wallet_new = new NEP6Wallet(path, password, Client.Settings);
    var privateKey = new byte[32];
    using (var rng = RandomNumberGenerator.Create())
    {
        rng.GetBytes(privateKey);
    }
    var newKey = new KeyPair(privateKey);
    var walletAccount = newWallet.CreateAccount(newKey.PrivateKey);
    newWallet.Save();

2. Import an existing account and add it to the wallet
------------------------------------------------------

    var wifFrom = "KzoToapKJze1sFUsGvPC5Rv4t2Um9DnrwWUe6T59DebZF2rDqdH1";
    var newWallet = new NEP6Wallet(path, password, Client.Settings);
    newWallet.Import(wifFrom);
    newWallet.Save();

3. Send DVG to the new address from an existing account
--------------------------------------------------------

    var tokenToTransfer = Client.DvgHash;
    var tokenHashAsUint = UInt160.Parse(tokenToTransfer);
    var transferAmount = 200_000_000;

    var receiverKey = walletAccount.GetKey();
    var sendKey = Neo.Network.RPC.Utility.GetKeyPair(wifFrom);

    var tx = await Client.WalletAPI.TransferAsync(tokenHashAsUint, sendKey, receiverKey.PublicKeyHash, transferAmount); 
    var txState = await Client.WalletAPI.WaitTransactionAsync(tx);


4. Check DVG balance for the new address
------------------------------------------

    var balanceReceiver = await Client.WalletAPI.GetTokenBalanceAsync(tokenToTransfer, receiverKey.PublicKey.ToString());


5. Create a new multisig address with minimum 2 of signatures required for verification.
----------------------------------------------------------------------------------------

    var key1 = Neo.Network.RPC.Utility.GetKeyPair(wifFrom);
    var key2 = DvitaWallet.GenerateNewKey();
    var key3 = DvitaWallet.GenerateNewKey();
    var multisigKeys = new Neo.Cryptography.ECC.ECPoint[] {key1.PublicKey, key2.PublicKey, key3.PublicKey};
    var multiContract = Contract.CreateMultiSigContract(2, multisigKeys);

6. Transfer 2 DVG from multisig account to another account
-----------------------------------------------------------

    var receiver = Contract.CreateSignatureContract(key1.PublicKey).ScriptHash;
    var tx = await Client.Nep17API.CreateTransferTxAsync(tokenHashAsUint, 2, multisigKeys, new[] { key2, key1 }, receiver, transferAmount);
    await Client.RpcClient.SendRawTransactionAsync(tx);
    var txState = await Client.WalletAPI.WaitTransactionAsync(tx);

7. Interact with a smart contract
---------------------------------

    var wif = "KzoToapKJze1sFUsGvPC5Rv4t2Um9DnrwWUe6T59DebZF2rDqdH1";
    var tokenToTransfer = "0x94054eae1f6b86e9dde12cab77f7afdff87f7277";
    var key = Neo.Network.RPC.Utility.GetKeyPair(wif);
    var sender = Contract.CreateSignatureContract(key.PublicKey).ScriptHash;

    var script = tokenHashAsUint.MakeScript("mint", sender, 10);
    var cosigners = new[] { new Signer { Scopes = WitnessScope.CalledByEntry, Account = sender } };
    var txManager = await new TransactionManagerFactory(Client.RpcClient).MakeTransactionAsync(script, cosigners);
    var tx = await txManager.AddSignature(key).SignAsync();
    await Client.RpcClient.SendRawTransactionAsync(tx);
    var txState = await Client.WalletAPI.WaitTransactionAsync(tx);


