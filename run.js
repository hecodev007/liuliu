const Web3 = require('web3');
const fs = require('fs');
const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');

let path = __dirname + '/keys.json';

function randomHex() {
    let x = Math.floor(Math.random() * 16);
    if (x > 9) {
        return String.fromCharCode(97 + x - 10);
    } else
        return x.toString();
}

function randomKey() {
    let key = '0x';
    for (let i = 0; i < 64; ++i) {
        key += randomHex();
    }
    return key;
}

function generateAccounts() {
    let keys = [];
    for (let i = 0; i < 500; ++i) {
        keys.push(randomKey());
    }
    fs.writeFileSync(
        path,
        JSON.stringify(keys, null, '\t'),
    );
}

function loadAccounts() {
    let keys = JSON.parse(fs.readFileSync(path));
    keys.map((x) => web3.eth.accounts.wallet.add(x));

    // let addresses = keys.map((x) => web3.eth.accounts.privateKeyToAccount(x).address);
    // let path1 = __dirname + '/address.json';
    // fs.writeFileSync(
    //   path1,
    //   JSON.stringify(addresses, null, '\t'),
    // );

    // console.log("wallet 0:",web3.eth.accounts.wallet[0].address);

}


//合约地址
const contractAddress = '0x9c6E3363f3f303Ff561C4519996205D66b043CF0';
const abiJson = fs.readFileSync("abi.json", "utf-8");
//创建合约对象
const Contract = new web3.eth.Contract(JSON.parse(abiJson), contractAddress);


const main = async function () {

    //将私钥加载
    await loadAccounts();
    for (let i = 0; i < web3.eth.accounts.wallet.length; i++) {
        let _from = web3.eth.accounts.wallet[i].address;
        //发送合约交易
        await Contract.methods.setGreeting("hello").send({
            from: _from,
            gasLimit: web3.utils.toHex(250000),
            gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
            // value: web3.utils.toHex(web3.utils.toWei('1', 'ether'))
        }, function (error, transactionHash) {
            console.log("hash:", transactionHash);
        });

    }


}

main().catch((err) => {
    console.error(err);
});