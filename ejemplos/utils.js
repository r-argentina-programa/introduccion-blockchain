/**
 * 
 * @param {import("stellar-sdk").Horizon.BalanceLineAsset} balance
 * @returns {String}
 */
function getAssetCanonicalNameFromBalance(balance){
    return balance.asset_type === Asset.native().getAssetType() ? 'XLM' : `${balance.asset_code}:${balance.asset_issuer}`;
}

/**
 * 
 * @param {String} issuer 
 * @returns {import("stellar-sdk").Asset}
 */
function createRandomAsset(issuer){
    const codigoAleatorio = "TEST" + Math.floor(Math.random() * 1000).toString();
    return new Asset(codigoAleatorio, issuer);
}