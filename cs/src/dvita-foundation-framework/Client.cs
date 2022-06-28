using Neo;
using Neo.Network.RPC;

namespace DvitaFoundationFramework
{
    public static class Client
    {
        public static string Url = "http://rpc.testnet.dvita.com:20332";
        public static string DvitaHash = "0xb34e1025391e953a918231df11478ec21b039e5f";
        public static string DvgHash = "0xd2a4cff31913016155e38e474a2c06d08be276cf";
        public static ProtocolSettings Settings => ProtocolSettings.Load(@".\config.json");
        public static RpcClient RpcClient => new RpcClient(new Uri(Url), null, null, Settings);
        public static WalletAPI WalletAPI => new WalletAPI(RpcClient);
        public static Nep17API Nep17API => new Nep17API(RpcClient);
    }
}
