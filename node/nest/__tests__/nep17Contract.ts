import { rpc, wallet, sc, tx } from "@cityofzion/neon-core";
import * as Constant from "../src/constants";
import * as TestConstant from "./testConstants";

let rpcClient: rpc.RPCClient;
beforeAll(async () => {
  const url = Constant.LOCALNET_URL;
  rpcClient = new rpc.RPCClient(url);
});

describe("Nep17Contract", () => {
  test("totalSupply", async () => {
    const dvitaContract = new sc.Nep17Contract(Constant.NATIVE_CONTRACT_HASH.DvitaToken);
    const contractCall = dvitaContract.totalSupply();

    const result = await rpcClient.invokeFunction(
      contractCall.scriptHash,
      contractCall.operation,
      contractCall.args
    );

    expect(result.state).toBe("HALT");
    expect(result.stack).toStrictEqual([
      {
        type: "Integer",
        value: "1000000000",
      },
    ]);
  });

  test("symbol", async () => {
    const dvitaContract = new sc.Nep17Contract(Constant.NATIVE_CONTRACT_HASH.DvitaToken);
    const contractCall = dvitaContract.symbol();

    const result = await rpcClient.invokeFunction(
      contractCall.scriptHash,
      contractCall.operation,
      contractCall.args
    );

    expect(result.state).toBe("HALT");
    expect(result.stack).toStrictEqual([
      {
        type: "ByteString",
        value: "RFZJVEE=",
      },
    ]);
  });

  test("decimals", async () => {
    const dvgContract = new sc.Nep17Contract(Constant.NATIVE_CONTRACT_HASH.DvgToken);
    const contractCall = dvgContract.decimals();

    const result = await rpcClient.invokeFunction(
      contractCall.scriptHash,
      contractCall.operation,
      contractCall.args
    );

    expect(result.state).toBe("HALT");
    expect(result.stack).toStrictEqual([
      {
        type: "Integer",
        value: "8",
      },
    ]);
  });

  test("balanceOf", async () => {
    const dvitaContract = new sc.Nep17Contract(Constant.NATIVE_CONTRACT_HASH.DvitaToken);
    
    const account=new wallet.Account(TestConstant.TESTACCOUNT_PRIVKEY1);
    const contractCall = dvitaContract.balanceOf(account.address);

    const result = await rpcClient.invokeFunction(
      contractCall.scriptHash,
      contractCall.operation,
      contractCall.args
    );

    expect(result.state).toBe("HALT");
    expect(result.stack).toHaveLength(1);

    expect(result.stack[0].type).toBe("Integer");
    expect(parseInt(result.stack[0].value as string)).toBeGreaterThan(0);
  });

  test("mint", async () => {
    const mintMethod = new sc.ContractMethodDefinition({
      name: "mint",
      parameters: [
        { name: "byteArr", type: sc.ContractParamType.Hash160 },
        { name: "amount", type: sc.ContractParamType.Integer },
    ]
    });
    const methodArr:sc.ContractMethodDefinition[] = [mintMethod];

    const contractToCall = new sc.Nep17Contract(TestConstant.TEST_CONTRACT, methodArr);
    const account = new wallet.Account(TestConstant.TESTACCOUNT_PRIVKEY1);
    const contractCall = contractToCall.call("mint", 
      {type: "Hash160", value:account.scriptHash},
      {type: "Integer", value: 10}
    );

    const signers= [ new tx.Signer({
      account: account.scriptHash,
      scopes: tx.WitnessScope.CalledByEntry
    })];

    const result = await rpcClient.invokeFunction(
      contractCall.scriptHash,
      contractCall.operation,
      contractCall.args,
      signers
    );

    expect(result.state).toBe("HALT");
    expect(result.stack).toHaveLength(1);
  });
});
