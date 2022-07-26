import React, { useContext, useEffect } from 'react';
import { createContext } from 'react';
import { WalletConnectorSdk } from '@3walletconnector/core';

export const WalletConnectorConrtext = createContext<WalletConnectorSdk | null>(
  null,
);

export function WalletConnectorProvider(
  props: React.PropsWithChildren<{ walletConnector: WalletConnectorSdk }>,
) {
  const { walletConnector } = props;

  useEffect(() => {
    walletConnector.eagerlyConnect();
  }, [walletConnector]);

  return (
    <WalletConnectorConrtext.Provider value={walletConnector}>
      {props.children}
    </WalletConnectorConrtext.Provider>
  );
}

export function useWalletConnector() {
  const context = useContext(WalletConnectorConrtext);

  if (!context) throw new Error('no Web3AuthConrtext');

  return context;
}
