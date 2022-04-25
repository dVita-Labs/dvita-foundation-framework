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

describe("createWalletAndSendDvita", () => {
  test("creates a new wallet, sends DVITA and checks balance", async () => {
    const newAccount = new wallet.Account();
    const fromAccount = new wallet.Account(TestConstant.TESTACCOUNT_PRIVKEY2);

    const script = sc.createScript({
      scriptHash: Constant.NATIVE_CONTRACT_HASH.DvitaToken,
      operation: "transfer",
      args: [
        sc.ContractParam.hash160(fromAccount.address),
        sc.ContractParam.hash160(newAccount.address),
        sc.ContractParam.integer(1),
        sc.ContractParam.any(),
      ],
    });

    const currentHeight = await client.getBlockCount();
    const transaction = new tx.Transaction({
      signers: [
        {
          account: fromAccount.scriptHash,
          scopes: tx.WitnessScope.CalledByEntry,
        },
      ],
      validUntilBlock: currentHeight + 1000,
      systemFee: "100000001",
      networkFee: "100000001",
      script,
    })
      .sign(fromAccount, Constant.LOCALNET_NETWORK_MAGIC);

      const txResult = await client.sendRawTransaction(transaction);
      expect(typeof txResult).toBe("string"); 
      
      await new Promise(resolve => setTimeout(resolve, 16000));
      const balanceResponse = await client.execute(
        new rpc.Query({
          method: "getnep17balances",
          params: [newAccount.address],
        })) as rpc.GetNep17BalancesResult;
        const dvitaBalance = balanceResponse.balance.filter((bal) =>
        bal.assethash.includes(Constant.NATIVE_CONTRACT_HASH.DvitaToken));

      expect(dvitaBalance[0].amount).toEqual("1"); 
    },25000);
  });

