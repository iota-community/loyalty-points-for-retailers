
import { ConnectButton, useCurrentAccount } from '@iota/dapp-kit';
import { BuyProduct } from './BuyProduct';

function App() {
  const currentAccount = useCurrentAccount();

  return (
    <div>
      <header>
        <h1>Retail Store dApp</h1>
        <ConnectButton />
      </header>
      <main>
        {currentAccount ? <BuyProduct /> : <p>Please connect your wallet</p>}
      </main>
    </div>
  );
}

export default App;
