# Two JS SDKs demo

This won't work for you out of the box, you would need to put your private key into the `LIT_ROLLUP_MAINNET_DEPLOYER_PRIVATE_KEY` env var and also set `cayennePKPPublicKey` and `habaneroPKPPublicKey` in index.js to keys that your wallet owns

Once you've set the above variables, you can run with `npm run start`

You should expect to see the following log output if it worked:

```
cayenneResult:  true
habaneroResult:  true
```
