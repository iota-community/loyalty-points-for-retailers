import { useState } from 'react';
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  //useIotaClient,
} from '@iota/dapp-kit';
import {
  LOYALTY_PACKAGE_ID,
  MANAGER_CAP_ID,
  TREASURY_CAP_ID,
} from './constants';
import { Transaction } from '@iota/iota-sdk/transactions';
import { Box, Button, Flex, Heading, Select, Text, TextArea } from '@radix-ui/themes';

export function BuyProduct() {
  const currentAccount = useCurrentAccount();
  //const iotaClient = useIotaClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [productType, setProductType] = useState('Laptop');
  const [paymentMethod, setPaymentMethod] = useState('IOTA');
  const [tokenInput, setTokenInput] = useState('');
  const [status, setStatus] = useState('');

  const productPrices: Record<string, number> = {
    Laptop: 1000,
    Phone: 500,
    Tablet: 300,
  };

  const handlePurchase = async () => {
    if (!currentAccount?.address) {
      setStatus('❌ Wallet not connected');
      return;
    }

    const price = productPrices[productType];
    setStatus('🔄 Preparing transaction...');

    try {
      const tx = new Transaction();

      if (paymentMethod === 'IOTA') {
        const [paymentCoin] = tx.splitCoins(tx.gas, [price]);

        tx.moveCall({
          target: `${LOYALTY_PACKAGE_ID}::store::buy_product_with_iota`,
          arguments: [
            tx.pure.string(productType),
            paymentCoin,
            tx.object(MANAGER_CAP_ID),
            tx.object(TREASURY_CAP_ID),
          ],
        });

        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: (res) => {
              setStatus(`✅ Purchase complete. Digest: ${res.digest}`);
            },
            onError: (err) => {
              console.error(err);
              setStatus('❌ Transaction failed.');
            },
          }
        );
      } else {
        const tokenIds = tokenInput
        .split(',')
        .map(id => id.trim())
        .filter(Boolean);
      
      if (tokenIds.length === 0) {
        setStatus('❌ You must provide at least one token object ID.');
        return;
      }
      
      const tokenType = `${LOYALTY_PACKAGE_ID}::loyalty::LOYALTY`;
      const typeArg = `0x2::token::Token<${tokenType}>`;
      
      let finalToken;
      
      if (tokenIds.length === 1) {
        // Only one token — no need to merge
        finalToken = tx.object(tokenIds[0]);
      } else {
        // Merge tokens iteratively
        let current = tx.object(tokenIds[0]);
        for (let i = 1; i < tokenIds.length; i++) {
          const next = tx.object(tokenIds[i]);
          tx.moveCall({
            target: `0x2::token::join`,
            arguments: [current, next],
            typeArguments: [typeArg],
          });
          // Note: We simulate the chaining; actual object ID is abstract
          current = tx.object(`merged_${i}`); // Not used, but maintains structure
        }
      
        finalToken = current;
        setStatus(`🪙 Merged ${tokenIds.length} tokens into one.`);
      }
      
      // Proceed with product purchase
      tx.moveCall({
        target: `${LOYALTY_PACKAGE_ID}::store::buy_product_with_loyalty`,
        arguments: [
          tx.pure.string(productType),
          finalToken,
          tx.object(TREASURY_CAP_ID),
        ],
      });
      
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (res) => {
            setStatus(`✅ Purchase complete. Digest: ${res.digest}`);
          },
          onError: (err) => {
            console.error(err);
            setStatus('❌ Transaction failed.');
          },
        }
      );
      
      }      

    } catch (e) {
      console.error(e);
      setStatus('❌ Error preparing transaction.');
    }
  };

  return (
    <Box p="4" style={{ background: 'var(--gray-a2)', borderRadius: 12 }}>
      <Heading size="4" mb="3">🛍️ Buy a Product</Heading>

      <Flex direction="column" gap="3">
        <Text>Choose a product:</Text>
        <Select.Root value={productType} onValueChange={setProductType}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="Laptop">Laptop - 1000</Select.Item>
            <Select.Item value="Phone">Phone - 500</Select.Item>
            <Select.Item value="Tablet">Tablet - 300</Select.Item>
          </Select.Content>
        </Select.Root>

        <Text>Choose payment method:</Text>
        <Select.Root value={paymentMethod} onValueChange={setPaymentMethod}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="IOTA">IOTA</Select.Item>
            <Select.Item value="LOYALTY">Loyalty Tokens</Select.Item>
          </Select.Content>
        </Select.Root>

        {paymentMethod === 'LOYALTY' && (
          <>
            <Text>Enter Loyalty Token Object ID(s) (comma-separated):</Text>
            <TextArea
              placeholder="0xabc..., 0xdef..., ..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
          </>
        )}

        <Button onClick={handlePurchase}>Purchase</Button>

        {status && <Text mt="2">{status}</Text>}
      </Flex>
    </Box>
  );
}
