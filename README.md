# IOTA Retail Store dApp

This dApp is built using [`@iota/create-dapp`](https://www.npmjs.com/package/@iota/create-dapp), with a custom Move backend to simulate a retail store with IOTA payments and a loyalty token reward system.

It uses the following stack:

- [React](https://react.dev/) for the UI
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Vite](https://vitejs.dev/) for fast builds and dev server
- [Radix UI](https://www.radix-ui.com/) for modern, accessible components
- [ESLint](https://eslint.org/) for code linting
- [`@iota/dapp-kit`](https://docs.iota.org/ts-sdk/dapp-kit) to connect with IOTA wallets
- [pnpm](https://pnpm.io/) as the package manager

---

## 🛠 Features

- Buy products using IOTA or loyalty tokens
- Automatically reward loyalty tokens upon IOTA purchases
- Merge loyalty tokens when needed using `token::join`
- Fully supports IOTA testnet via the CLI

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start development server

```bash
pnpm dev
```

Your app will be available at `http://localhost:5173`.

---

## 🧪 Testnet Setup (IOTA CLI)

To deploy and interact with Move contracts, you'll need the [IOTA CLI](https://docs.iota.org/developer/getting-started/install-iota).

### Set up the testnet environment

```bash
iota client new-env --alias testnet --rpc https://fullnode.testnet.iota.org:443
iota client switch --env testnet
```

### Create and select an address

```bash
iota client new-address --key-scheme secp256k1
iota client switch --address 0xYOUR_ADDRESS
```

### Request testnet IOTA (gas)

```bash
iota client faucet
```

---

## 📦 Deploying Move Code

Move contracts are located in the `move` directory. To publish:

```bash
cd move
iota client publish --gas-budget 100000000 loyalty_points_package
```

Copy the generated `packageId` into your `src/constants.ts`:

```ts
export const LOYALTY_PACKAGE_ID = "0x..."; // <- replace with your actual ID
```

---

## 🏗 Build for Production

```bash
pnpm build
```

---

## 🧾 License

[Apache 2.0](LICENSE)
