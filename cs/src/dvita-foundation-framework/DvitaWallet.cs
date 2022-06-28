using Neo.Wallets;
using Neo.Wallets.NEP6;
using System.Security.Cryptography;

namespace DvitaFoundationFramework
{
    public class DvitaWallet
    {
        public static KeyPair GenerateNewKey()
        {
            var privateKey = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(privateKey);
            }
            var keyPair = new KeyPair(privateKey);
            return keyPair;
        }

        public static WalletAccount CreateWallet(string path, string password)
        {
            var newWallet = new NEP6Wallet(path, password, Client.Settings);
            var newKey = GenerateNewKey();
            var walletAccount = newWallet.CreateAccount(newKey.PrivateKey);
            newWallet.Save();
            return walletAccount;
        }

    }
}
