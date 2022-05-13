// esto es simplemente para obtener los tipos
const sdk = /** @type {import("stellar-sdk")} */ (window.StellarSdk);

const { Keypair, Asset, Server, TransactionBuilder, Operation } = sdk;
const server = new Server('https://horizon-testnet.stellar.org');
// esto nunca se hace!! es sólo de ejemplo. El frontend siempre crea transacciones SIN firmar.
// Y luego se las envía a un servidor que tiene las llaves aseguradas para firmar.
const keyPair = sdk.Keypair.fromSecret("SCFYENBUNWJOBSETNTJBYU2DCT4Q5N4W5BM4CHQMXXUIIKJ5CRP4D2QR");


async function cargarBalances(){
    // Prestar atención a lo que pasa en el network tab
    const accountA = await server.loadAccount("GCVNCIT5MGXR6PS6G4NT7MRWUSH5NK2KFBEOVITEDAWYN2OELKVV33YQ"); // A
    const accountB = await server.loadAccount("GBWARZDWJB6V7LYPNBE5BGY2PFVPSRM2GPKKHT5KZDS4VMWF6MUUMP4D"); // B

    const xlmBalanceA = accountA.balances.filter(balance => balance.asset_type === Asset.native().getAssetType()).pop();
    const xlmBalanceB = accountB.balances.filter(balance => balance.asset_type === Asset.native().getAssetType()).pop();

    console.log(xlmBalanceA, xlmBalanceB);
    document.querySelector('#balance-a').textContent = xlmBalanceA.balance;
    document.querySelector('#balance-b').textContent = xlmBalanceB.balance;
}

async function realizarPago() {
    // GCVNCIT5MGXR6PS6G4NT7MRWUSH5NK2KFBEOVITEDAWYN2OELKVV33YQ
    const sourceAccount = await server.loadAccount(keyPair.publicKey());

    const tx = new TransactionBuilder(sourceAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: "Test SDF Network ; September 2015",
    }).addOperation(Operation.payment({
        amount: "1",
        asset: Asset.native(),
        // SBUIWFQYVUYDUWVV2XQSDATXHIID3EYB6S4ULZGORKQJNRXPQAGAP5KC
        destination: 'GBWARZDWJB6V7LYPNBE5BGY2PFVPSRM2GPKKHT5KZDS4VMWF6MUUMP4D' // cuenta B
    }))
    .setTimeout(60 * 10) //10 minutos, luego la tx falla
    .build();

    console.log(tx.toXDR());

    tx.sign(keyPair);

    try {
        const txResult = await server.submitTransaction(tx);
        console.log(txResult);
        cargarBalances();
    } catch (e) {
        console.error(e);
    }
}

document.querySelector('#cargar-balances').addEventListener('click', cargarBalances);
document.querySelector('#realizar-pago').addEventListener('click', realizarPago);
