const { ethers } = require("ethers");
const siwe = require("siwe");

const getAuthSig = async () => {
  const privateKey = process.env.LIT_ROLLUP_MAINNET_DEPLOYER_PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey);
  const address = await wallet.getAddress();

  // Craft the SIWE message
  const domain = "localhost";
  const origin = "https://localhost/login";
  const statement =
    "This is a test statement.  You can put anything you want here.";
  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
    statement,
    uri: origin,
    version: "1",
    chainId: 1,
    expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });
  const messageToSign = siweMessage.prepareMessage();

  // Sign the message and format the authSig
  const signature = await wallet.signMessage(messageToSign);

  const authSig = {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: address,
  };

  return authSig;
};

const pkpSign = async (litNodeClient, publicKey, sessionSigs) => {
  // console.log(`signing with pubkey ${publicKey}`);
  const authSig = await getAuthSig();
  try {
    const signature = await litNodeClient.pkpSign({
      authSig,
      // sessionSigs,
      // all jsParams can be used anywhere in your litActionCode
      toSign: ethers.getBytes(ethers.keccak256(ethers.toUtf8Bytes("meow"))),
      pubKey: publicKey,
    });
    // console.log("results: ", results);
    // toss nodes with missing shares
    // results.signatures = results.signatures.filter((signatures) => 'sig1' in signatures);
    if (signature && signature.length != 0) {
      // console.log("signature: ", signature);
    } else {
      console.log("ERROR: no signature returned from Lit Node!");
      return false;
    }
    return signature;
  } catch (e) {
    console.log("Error running PKP Sign: ", e);
    return e;
  }
};

const checkSig = async (result, publicKey) => {
  try {
    // check invariants and verify the signature
    const { dataSigned, signature, publicKey: publicKeyFromNode } = result;

    if (!dataSigned) {
      // we got an error
      console.error(result);
      return false;
    }

    const dataSentToBeSigned = ethers
      .keccak256(ethers.toUtf8Bytes("meow"))
      .slice(2)
      .toUpperCase();

    // check dataSigned
    if (dataSigned != dataSentToBeSigned) {
      errors.push({
        result,
        error: `dataSigned from nodes ${dataSigned} is not correct.  it should be ${dataSentToBeSigned}`,
      });
      return false;
    }

    // check signature
    const recoveredPubkey = ethers.SigningKey.recoverPublicKey(
      "0x" + dataSigned,
      signature,
    );
    if (!recoveredPubkey) {
      console.error(`recoveredPubkey is null`);
      return false;
    }
    if (
      recoveredPubkey.toLowerCase().replace("0x", "") !=
      publicKey.toLowerCase().replace("0x", "")
    ) {
      console.error(
        `recoveredPubkey ${recoveredPubkey.replace(
          "0x",
          "",
        )} is not correct.  it should be ${publicKey.replace("0x", "")}`,
      );
      return false;
    }
    if (
      publicKeyFromNode.toLowerCase().replace("0x", "") !=
      publicKey.toLowerCase().replace("0x", "")
    ) {
      console.error(
        `publicKeyFromNode ${publicKeyFromNode.replace(
          "0x",
          "",
        )} is not correct.  it should be ${publicKey.replace("0x", "")}`,
      );
      return false;
    }
  } catch (e) {
    console.error(e);
  }
  return true;
};

module.exports = { getAuthSig, pkpSign, checkSig };
