How to perform Blockchain transactions
======================================

1. Create a new wallet and generate a new address
-------------------------------------------------

    const newWallet = new wallet.Wallet();
    const newAccount = new wallet.Account();
    await newWallet.addAccount(newAccount);

2. Import an existing account and add it to the wallet
------------------------------------------------------

    const existngAccount = new wallet.Account("L26KYxNcUjcWUAic8UoX9GKuVAZRmuJvbaCjQbULRN8mLCX6tft5");
    await wallet.addAccount(existngAccount);

3. Send DVTA to the new address from an existing account
--------------------------------------------------------

    const currentHeight = await client.getBlockCount();
    const script = sc.createScript({
      scriptHash: Constant.NATIVE_CONTRACT_HASH.DvitaToken,
      operation: "transfer",
      args: [
        sc.ContractParam.hash160(existngAccount.address),
        sc.ContractParam.hash160(newAccount.address),
        sc.ContractParam.integer(1),
        sc.ContractParam.any(),
      ],
    });

    const transaction = new tx.Transaction({
      signers: [
        {
          account: existngAccount.scriptHash,
          scopes: tx.WitnessScope.CalledByEntry,
        },
      ],
      validUntilBlock: currentHeight + 1000,
      systemFee: "100000001",
      networkFee: "100000001",
      script,
    })
      .sign(fromAccount, 199);

      const txResult = await client.sendRawTransaction(transaction);

4. Check DVITA balance for the new address
------------------------------------------

      const balanceResponse = await client.execute(
        new rpc.Query({
          method: "getnep17balances",
          params: [ newAccount.address ],
        })) as rpc.GetNep17BalancesResult;

        const dvitaBalance = balanceResponse.balance.filter((bal) =>
        bal.assethash.includes(Constant.NATIVE_CONTRACT_HASH.DvitaToken));


5. Create a new multisig address with minimum 2 of signatures required for verification.
----------------------------------------------------------------------------------------

    const account1=new wallet.Account();
    const account2=new wallet.Account();
    const account3=new wallet.Account();
    const toAccount = new wallet.Account();
    const multisigAcct = wallet.Account.createMultiSig(2, [
      account1.publicKey,
      account2.publicKey,
      account3.publicKey,
    ]);

6. Transfer 5 DVTA from multisig account to another account
-----------------------------------------------------------

    const script = sc.createScript({
      scriptHash: Constant.NATIVE_CONTRACT_HASH.DvitaToken,
      operation: "transfer",
      args: [
        sc.ContractParam.hash160(multisigAcct.address),
        sc.ContractParam.hash160(toAccount.address),
        sc.ContractParam.integer(5),
        sc.ContractParam.any(),
      ],
    });

    const transaction = new tx.Transaction({
      signers: [
        {
          account: multisigAcct.scriptHash,
          scopes: tx.WitnessScope.CalledByEntry,
        },
      ],
      validUntilBlock: currentHeight + 1000,
      systemFee: "100000001",
      networkFee: "100000001",
      script,
    })
      .sign(account1, 199)
      .sign(account2, 199);

    const multisigWitness = tx.Witness.buildMultiSig(
      transaction.serialize(false),
      transaction.witnesses,
      multisigAcct
    );

    // Replace the single witnesses with the combined witness.
    transaction.witnesses = [ multisigWitnes ];

    const result = await client.sendRawTransaction(transaction);

7. Interact with a smart contract
---------------------------------

Invoke balanceOf

    const dvitaContract = new sc.Nep17Contract(Constant.NATIVE_CONTRACT_HASH.DvitaToken);
    const contractCall = dvitaContract.balanceOf(existngAccount.address);

    const result = await rpcClient.invokeFunction(
      contractCall.scriptHash,
      contractCall.operation,
      contractCall.args
    );

Invoke custom method from contract 

    const mintMethod = new sc.ContractMethodDefinition({
      name: "mint",
      parameters: [
        { name: "toHash", type: sc.ContractParamType.Hash160 },
        { name: "amount", type: sc.ContractParamType.Integer },
    ]
    });
    const methodArr:sc.ContractMethodDefinition[] = [mintMethod];

    const contractToCall = new sc.Nep17Contract("0x94054eae1f6b86e9dde12cab77f7afdff87f7277", methodArr);
    const contractCall = contractToCall.call("mint", 
        {type: "Hash160", value:existngAccount.scriptHash},
        {type: "Integer", value: 10}
    );

    const signers= [new tx.Signer({
      account: existngAccount.scriptHash,
      scopes: tx.WitnessScope.CalledByEntry,})];

    const result = await rpcClient.invokeFunction(
      contractCall.scriptHash,
      contractCall.operation,
      contractCall.args,
      signers
    );

    expect(result.state).toBe("HALT");
    expect(result.stack).toHaveLength(1);