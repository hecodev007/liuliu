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

// token deployed to: 0x44B6997A13Bb1a3dB3a1f94b873baB6Fc190aadc
// nft deployed to: 0xb8073fC76B4e0938146818D1e70210Ecf2948c71
// market deployed to: 0x484693613C0e58098542bECEe1Ae5328a8039932

// token deployed to: 0xeE0fdD2ecbA63158Da8D0DA0E84eec67200CABD3
// 0xd477113cf63728ce00aee95326c84c6f5155de183557bbbc01581899bc6a458c
// nft deployed to: 0x5Dd21d26CaCF4Cc77602E684C2fFD7B732905d30
// market deployed to: 0xb83843616c680107Ef3466a70623967a41F426d5

// token deployed to: 0x3A09b6a3276D83EcC07c7c8E0220DEE8A03E6706
// 0xdf35adb80b0e7ff9c0ed40ddf7e222854ea1d328c702ed04712dec7e90adb849
// nft deployed to: 0x514a40f31a637bB8757bf69918E11cc78364FA12
// market deployed to: 0x0CE25448dE92C67Fa7cFF1D175CEa6F8745bE6F0

const marketContract = '0x0CE25448dE92C67Fa7cFF1D175CEa6F8745bE6F0'
const busdAddress = '0x3A09b6a3276D83EcC07c7c8E0220DEE8A03E6706'
//批量授权
async function approve() {
    await loadAccounts()

     //busdAddress = busd;
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
    const abiJson = fs.readFileSync("market_both.json", "utf-8");
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
                    gasPrice: web3.utils.toHex(20000000000),
                    //value: web3.utils.toHex(web3.utils.toWei('1', 'ether'))
                    value: web3.utils.toHex('10000')
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
async function buyBusd() {
    //合约地址
    const contractAddress = marketContract;
    const abiJson = fs.readFileSync("market_both.json", "utf-8");
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
        const NFTid = i+1;
        arr.push(
            market.methods.buy(index, amount, prof.proof, NFTid).send(
                {
                    from: _from,
                    gasLimit: web3.utils.toHex(250000),
                    gasPrice: web3.utils.toHex(20000000000),
                    //value: web3.utils.toHex(web3.utils.toWei('1', 'ether'))
                    value: web3.utils.toHex('0')
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
            } else if (val == "trans=bnb") {
                console.log("trans begin")
                buy();

            }else if (val == "trans=busd") {
                console.log("trans begin")
                buyBusd();

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