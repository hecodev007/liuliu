const Web3 = require('web3');
const fs = require('fs');
const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');
//const web3 = new Web3('https://bsc-dataseed.binance.org/');

let path = __dirname + '/keys.json';
const helper = require('./helper');

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
//创建地址和私钥
function generateAccounts() {
    let keys = [];
    for (let i = 0; i < 500; ++i) {
        keys.push(randomKey());
    }
    fs.writeFileSync(
        path,
        JSON.stringify(keys, null, '\t'),
    );

    let addresses = keys.map((x) => web3.eth.accounts.privateKeyToAccount(x).address);
    let path1 = __dirname + '/address.json';
    fs.writeFileSync(
      path1,
      JSON.stringify(addresses, null, '\t'),
    );
}

//加载私钥
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


// token deployed to: 0x98f8512a00937022F5c6892273b043acCa9D14a8  //临时充当busd
// nft deployed to: 0xF93aBfbc3b4E30299Df9D1fa10ce2b09D2C7F5c6
// market deployed to: 0xA320C356Ba27C9De46B69318Bf723335b7730b65
const marketContract = '0xA320C356Ba27C9De46B69318Bf723335b7730b65'

//批量授权
async function approve() {
    await loadAccounts()

    const busdAddress = '0x98f8512a00937022F5c6892273b043acCa9D14a8';
    const abi = fs.readFileSync("erc.json", "utf-8");
    //创建合约对象
    const busd = new web3.eth.Contract(JSON.parse(abi), busdAddress);
    const authAddress = marketContract;

    const arr = []
    for (let i = 0; i < web3.eth.accounts.wallet.length; i++) {
        const _from = web3.eth.accounts.wallet[i].address
        arr.push(
            busd.methods.approve(authAddress, web3.utils.toWei('100000000000000', 'ether')).send(
                {
                    from: _from,
                    gasLimit: web3.utils.toHex(250000),
                    gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
                    // value: web3.utils.toHex(web3.utils.toWei(‘1’, ‘ether’))
                },
                function (error, transactionHash) {
                    console.log("hash:", transactionHash)
                }
            )
        )
    }
    await Promise.all(arr)
}
//批量购买
async function buy() {
    //合约地址
    const contractAddress = marketContract;
    const abiJson = fs.readFileSync("market.json", "utf-8");
    //创建合约对象
    const market = new web3.eth.Contract(JSON.parse(abiJson), contractAddress);

    await loadAccounts()
    const arr = []
    for (let i = 0; i < web3.eth.accounts.wallet.length; i++) {
        const _from = web3.eth.accounts.wallet[i].address
        const index = i;
        const amount = '500000000000000000000';
        const prof = helper.getProof(i);
        //  console.log("prof:",prof.proof)
        const NFTid = i + 1;
        arr.push(
            market.methods.buy(index, amount, prof.proof, NFTid).send(
                {
                    from: _from,
                    gasLimit: web3.utils.toHex(250000),
                    gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
                    // value: web3.utils.toHex(web3.utils.toWei(‘1’, ‘ether’))
                },
                function (error, transactionHash) {
                    console.log("hash:", transactionHash)
                }
            )
        )
    }
    await Promise.all(arr)
}


const main = async function () {

    process.argv.forEach(function (val, index, array) {
        // console.log(index + ': ' + val);
        if (index == 2) {
            if (val == "approve") {
                console.log("approve begin")
                approve();
            } else if (val == "trans") {
                console.log("trans begin")
                buy();

            } else if (val == "account") {
                console.log("create addr begin")
                generateAccounts()
            } else {
                console.log("wrong param!")
            }

        }

    });

}

main().catch((err) => {
    console.error(err);
});