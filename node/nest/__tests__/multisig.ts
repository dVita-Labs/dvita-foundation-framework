import { rpc, wallet, sc, tx } from "@cityofzion/neon-core";
import * as Constant from "../src/constants";
import * as TestConstant from "./testConstants";

let client: rpc.RPCClient;

beforeAll(async () => {
  const url = Constant.LOCALNET_URL;
  client = new rpc.RPCClient(url);

  const firstBlock = await client.getBlock(0, true);
  expect(firstBlock).toBeDefined();
}, 30000);

describe("multisig", () => {
  test("creates multisig account, signs and sends transaction from it", async () => {

    const currentHeight = await client.getBlockCount();
    const account1=new wallet.Account(TestConstant.TESTACCOUNT_PRIVKEY1);
    const account2=new wallet.Account(TestConstant.TESTACCOUNT_PRIVKEY2);
    const account3=new wallet.Account(TestConstant.TESTACCOUNT_PRIVKEY3);
    const multisigAcct = wallet.Account.createMultiSig(2, [
      account1.publicKey,
      account2.publicKey,
      account3.publicKey
    ]);

    //Transfer dvg to multisig account to avoid insufficient funds error
    const scriptForDvgTransfer = sc.createScript({
      scriptHash: Constant.NATIVE_CONTRACT_HASH.DvgToken,
      operation: "transfer",
      args: [
        sc.ContractParam.hash160(account2.address),
        sc.ContractParam.hash160(multisigAcct.address),
        sc.ContractParam.integer(200000002),
        sc.ContractParam.any(),
      ],
    });

    const transactionForDvgTransfer = new tx.Transaction({
      signers: [
        {
          account: account2.scriptHash,
          scopes: tx.WitnessScope.CalledByEntry,
        },
      ],
      validUntilBlock: currentHeight + 1000,
      systemFee: "100000001",
      networkFee: "100000001",
      script: scriptForDvgTransfer
    })
      .sign(account2, Constant.LOCALNET_NETWORK_MAGIC);

      await client.sendRawTransaction(transactionForDvgTransfer);
      await new Promise(resolve => setTimeout(resolve, 15000));

    const script = sc.createScript({
      scriptHash: Constant.NATIVE_CONTRACT_HASH.DvgToken,
      operation: "transfer",
      args: [
        sc.ContractParam.hash160(multisigAcct.address),
        sc.ContractParam.hash160(account1.address),
        sc.ContractParam.integer(1),
        sc.ContractParam.any(),
      ],
    });

    //Transaction from multisig address
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
      .sign(account2, Constant.LOCALNET_NETWORK_MAGIC)
      .sign(account3, Constant.LOCALNET_NETWORK_MAGIC);

    const multisigWitness = tx.Witness.buildMultiSig(
      transaction.serialize(false),
      transaction.witnesses,
      multisigAcct
    );

    // Replace the single witnesses with the combined witness.
    transaction.witnesses = [multisigWitness];

    const result = await client.sendRawTransaction(transaction);
    expect(typeof result).toBe("string");
  }, 25000);
});