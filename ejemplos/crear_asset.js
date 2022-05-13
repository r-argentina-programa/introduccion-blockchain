// esto es simplemente para obtener los tipos
const sdk = /** @type {import("stellar-sdk")} */ (window.StellarSdk);

const { Keypair, Asset, Server, TransactionBuilder, Operation } = sdk;
const server = new Server('https://horizon-testnet.stellar.org');

// esto nunca se hace!! es sólo de ejemplo. El frontend siempre crea transacciones SIN firmar.
// Y luego se las envía a un servidor que tiene las llaves aseguradas para firmar.
// GDBBAFAWWMEF434FF3TRWPHO27XNHODOZSAW6B5NYABJNQUDCQRXPS4O
const issuerKeyPair = sdk.Keypair.fromSecret("SD32R4XLF32SREPD3HJIWEQAKZ4XY7NS3JB6XMZTU7B4TTNOZTSEISKK");
// esto nunca se hace!! es sólo de ejemplo. El frontend siempre crea transacciones SIN firmar.
// Y luego se las envía a un servidor que tiene las llaves aseguradas para firmar.
// GA62STNRZ3MGY2UUBSVBJUV2K4DPW4YQIWDZMFK7JOVFPF3DK7X7HQRY
const distributorKeyPair = sdk.Keypair.fromSecret("SAA2NNI5BHVJNFN5QN6WO4OL7DSOTTQ6QECUUWM5223D2S5VWMIVV5UN");

async function loadBalances() {
    const issuerAccount = await server.loadAccount(issuerKeyPair.publicKey());
    const distributorAccount = await server.loadAccount(distributorKeyPair.publicKey());

    const $issuerBalances = document.querySelector('#issuer-balances');
    const $distributorBalances = document.querySelector('#distributor-balances');

    $issuerBalances.innerHTML = '';
    $distributorBalances.innerHTML = '';

    issuerAccount.balances.forEach(balance => {
        const $balance = document.createElement('li');
        $balance.textContent = `${balance.balance} ${getAssetCanonicalNameFromBalance(balance)}`;
        $issuerBalances.appendChild($balance);
    });

    distributorAccount.balances.forEach(balance => {
        const $balance = document.createElement('li');
        $balance.textContent = `${balance.balance} ${getAssetCanonicalNameFromBalance(balance)}`;
        $distributorBalances.appendChild($balance);
    });
}

async function createAsset() {
    const sourceAccount = await server.loadAccount(issuerKeyPair.publicKey());
    const randomAsset = createRandomAsset(issuerKeyPair.publicKey());

    console.log(randomAsset);

    const tx = new TransactionBuilder(sourceAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: "Test SDF Network ; September 2015",
    })
    // primero debemos crear confianza en el asset, el orden de las operaciones importa
    .addOperation(Operation.changeTrust({
        source: distributorKeyPair.publicKey(),
        asset: randomAsset,
        // limit por default es el máximo, pero podríamos decir limit 1 para decir "sólo quiero recibir como máximo 1 de esta moneda"
    }))
    // luego podemos pagarlo/crearlo (mostrar ejemplo de qué pasa si se borra la operación anterior y se quita la firma del distributor)
    .addOperation(Operation.payment({
        amount: "1",
        asset: randomAsset,
        destination: distributorKeyPair.publicKey()
    }))
        .setTimeout(60 * 10) //10 minutos, luego la tx falla
        .build();

    // Mostrar el XDR resultante en el laboratorio
    console.log(tx.toXDR());

    // Ambos necesitan firmar, el distribuidor porque está creando confianza...
    tx.sign(distributorKeyPair);
    // ... y el issuer porque está pagando
    tx.sign(issuerKeyPair);

    try {
        const txResult = await server.submitTransaction(tx);
        console.log(txResult);
        loadBalances();
    } catch (e) {
        console.error(e);
    }
}

document.querySelector('#load-balances').addEventListener('click', loadBalances);
document.querySelector('#create-asset').addEventListener('click', createAsset);
