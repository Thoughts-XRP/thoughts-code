import { Network } from "@tronweb3/tronwallet-abstract-adapter";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapters";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import { currentNetwork, factoryAddress, getTronWebConfig } from "scripts";
// @ts-ignore
import TronWeb from "tronweb";

export const WalletContext = createContext<TronWallet | null>(null);

export type TronWallet = {
  address?: string;
  connected?: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  provider: TronWeb;
  wallet: TronLinkAdapter;
};

export const useCurrentWallet = () => {
  return useContext(WalletContext);
};

export const WalletProvider = ({ children }: any) => {
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);

  const adapter = useMemo(() => new TronLinkAdapter(), []);

  const provider = useMemo(() => {
    const tronWeb = getTronWebConfig(currentNetwork);

    if (account) tronWeb.setAddress(account);
    else tronWeb.setAddress(factoryAddress);

    return tronWeb;
  }, [account]);

  useEffect(() => {
    adapter.on("connect", async () => {
      setAccount(adapter.address);
    });

    adapter.on("accountsChanged", () => {
      setAccount(adapter.address);
    });

    adapter.on("chainChanged", async () => {
      // TODO: Check If Other Than Nile
    });

    adapter.on("disconnect", () => {
      setAccount(null);
    });

    return () => {
      adapter.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    setConnected(adapter.connected);
  }, [adapter.connected]);

  const connect = async () => {
    try {
      await adapter.connect();
      window.location.reload();
    } catch (error) {
      toast.error("Wallet Connect Failed");
    }
  };

  const disconnect = async () => {
    try {
      await adapter.disconnect();
    } catch (error) {
      toast.error("Wallet Disconnect Failed");
    }
  };

  const value: TronWallet = {
    address: account,
    connected,
    connect,
    disconnect,
    provider,
    wallet: adapter,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
