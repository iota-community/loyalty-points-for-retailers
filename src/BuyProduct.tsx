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

    
          if (!currentAccount?.address) {
            setStatus('❌ Wallet not connected');
            return;
          }
        
          const tokenIds = tokenInput
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);
        
          if (tokenIds.length === 0) {
            setStatus('❌ You must provide at least one token object ID.');
            return;
          }
        
          const loyaltyType = `${LOYALTY_PACKAGE_ID}::loyalty::LOYALTY`;
          //const typeArg = `0x2::token::Token<${loyaltyType}>`;
        
          //const price = productPrices[productType];
        
          try {
            if (tokenIds.length === 1) {
              // ✅ One token → direct purchase
              const tx = new Transaction();
        
              tx.moveCall({
                target: `${LOYALTY_PACKAGE_ID}::store::buy_product_with_loyalty`,
                arguments: [
                  tx.pure.string(productType),
                  tx.object(tokenIds[0]),
                  tx.object(TREASURY_CAP_ID),
                ],
              });
        
              setStatus('🛒 Submitting purchase...');
              signAndExecuteTransaction(
                { transaction: tx },
                {
                  onSuccess: (res) =>
                    setStatus(`✅ Purchase complete. Digest: ${res.digest}`),
                  onError: (err) => {
                    console.error(err);
                    setStatus('❌ Transaction failed.');
                  },
                }
              );
            } else {
              // ✅ Multiple tokens → merge first, then purchase
              const mergeTx = new Transaction();
              const base = mergeTx.object(tokenIds[0]);
        
              for (let i = 1; i < tokenIds.length; i++) {
                const next = mergeTx.object(tokenIds[i]);
                mergeTx.moveCall({
                  target: `0x2::token::join`,
                  arguments: [base, next],
                  typeArguments: [loyaltyType],
                });
              }
        
              setStatus(`🪙 Merging ${tokenIds.length} tokens...`);
              signAndExecuteTransaction(
                { transaction: mergeTx },
                {
                  onSuccess: (res) => {
                    setStatus(`✅ Tokens merged. Digest: ${res.digest}. Proceeding to purchase...`);
        
                    // Step 2: use the original first token (it’s now the merged one)
                    const purchaseTx = new Transaction();
        
                    purchaseTx.moveCall({
                      target: `${LOYALTY_PACKAGE_ID}::store::buy_product_with_loyalty`,
                      arguments: [
                        purchaseTx.pure.string(productType),
                        purchaseTx.object(tokenIds[0]), // ✅ THIS is the merged token
                        purchaseTx.object(TREASURY_CAP_ID),
                      ],
                    });
        
                    signAndExecuteTransaction(
                      { transaction: purchaseTx },
                      {
                        onSuccess: (res2) =>
                          setStatus(`✅ Product purchased. Digest: ${res2.digest}`),
                        onError: (err) => {
                          console.error(err);
                          setStatus('❌ Purchase transaction failed.');
                        },
                      }
                    );
                  },
                  onError: (err) => {
                    console.error(err);
                    setStatus('❌ Token merge failed.');
                  },
                }
              );
            }
          } catch (e) {
            console.error(e);
            setStatus('❌ Unexpected error during transaction.');
          }       
      
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
