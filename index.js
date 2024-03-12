const LitJsSdk = require("@lit-protocol/lit-node-client-nodejs");
const { pkpSign, checkSig } = require("./utils");

const main = async () => {
  const cayenne = new LitJsSdk.LitNodeClientNodeJs({ litNetwork: "cayenne" });
  await cayenne.connect();
  const habanero = new LitJsSdk.LitNodeClientNodeJs({ litNetwork: "habanero" });
  await habanero.connect();
  console.log(
    `Connected to cayenne nodes: ${JSON.stringify(
      Array.from(cayenne.connectedNodes),
      null,
      2,
    )}`,
  );
  console.log(
    `Connected to habanero nodes: ${JSON.stringify(
      Array.from(habanero.connectedNodes),
      null,
      2,
    )}`,
  );

  // attempt to sign something on cayenne
  const cayennePKPPublicKey =
    "045805f3e9d9f52efdfc4d08166069c20642c7cdee262a77f32946d0aad7479ff34ddff9b444396c3011f02428939cc9e4080afd719eef850b8f1c792f65582bd6";
  const cayenneResult = await pkpSign(cayenne, cayennePKPPublicKey);
  const checkedCayenneResult = await checkSig(
    cayenneResult,
    cayennePKPPublicKey,
  );

  // attempt to sign something on habanero
  const habaneroPKPPublicKey =
    "04c08209ae39105d10c66bc60411c17054f5153b6e26fb7cb65ca3d634935445309b3d66b49e1bd6e6a1cb042fab6d4dbf509f22b338b4b1b878881f09b600037d";
  const habaneroResult = await pkpSign(habanero, habaneroPKPPublicKey);
  const checkedHabaneroResult = await checkSig(
    habaneroResult,
    habaneroPKPPublicKey,
  );

  console.log("cayenneResult: ", checkedCayenneResult);
  console.log("habaneroResult: ", checkedHabaneroResult);

  process.exit(0);
};

main().catch(console.error);
