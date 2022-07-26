import { Actions } from '../domain/actions';
import { BaseConnector } from '../domain/connector';
import { WalletState } from '../domain/walletstate';
import { Store } from '../domain/store';
import { Configure } from '../domain';
import { WalletMemoryRepo } from '../repo';
import { Class } from 'utility-types';

export class WalletConnectorSdk {
  public store: Store;
  private actions: Actions;
  public connectors: BaseConnector[] = [];
  public connector?: BaseConnector;
  private _walletMemoryRepo: WalletMemoryRepo;

  public constructor(
    public configure: Configure,
    classConnectors: Class<BaseConnector>[],
  ) {
    this.store = new Store();

    this.actions = new Actions(this.store);

    this._walletMemoryRepo = new WalletMemoryRepo(this.configure);

    this.setConnectors(classConnectors);
  }

  /**
   * setConnectors
   * @param classConnectors
   */
  public setConnectors(classConnectors: Class<BaseConnector>[]) {
    this.connectors = [];

    classConnectors.forEach(Connector => {
      this.connectors.push(
        new Connector(this.actions, this.store, this.configure),
      );
    });
  }

  /**
   * connect
   * @param walletName
   * @returns
   */
  public async connect(walletName: string) {
    this.connector = this._findConnector(walletName);

    if (!this.connector) throw new Error(`no wallet by ${walletName}`);

    await this.connector.connect({ eagerly: false });

    this._walletMemoryRepo.set(walletName);

    return WalletState.fromDto(this.store.state);
  }

  /**
   * signMessage
   * @param message
   * @returns
   */
  public async signMessage(message: string): Promise<string> {
    return await this.connector!.signMessage(message);
  }

  /**
   * eagerly Connect
   */
  public async eagerlyConnect(): Promise<void> {
    const walletName = this._walletMemoryRepo.get();
    if (!walletName) return;

    this.connector = this._findConnector(walletName);
    if (!this.connector) return;

    await this.connector.connect({ eagerly: true });
  }

  /**
   * Disconnect Wallet
   */
  public async disconnect(): Promise<void> {
    await this.connector?.disconnect();

    this.actions.disconnect();

    this._walletMemoryRepo.clear();
  }

  /**
   * subscribeChange
   */
  public get subscribeChange() {
    return this.store.subscribe;
  }

  private _findConnector(connectorName: string): BaseConnector | undefined {
    return this.connectors.find(c => c.name === connectorName);
  }
}
