const {MerkleTree} = require("merkletreejs");
const keccak256 = require("keccak256");
const Web3 = require("web3");
var fs = require('fs')
const web3 = new Web3();

let data = [{"address":"0x2287374e8d7090214628adad44Ff1ab56b9284D1","amount":500000000000000000000,"index":0},{"address":"0x07cB5cD417d8EB9373849e8F482Cb2031d9F1e43","amount":500000000000000000000,"index":1}];


function formatNumber(num) {
    return web3.utils.padLeft(web3.utils.numberToHex(num).slice(2), 64);
}


data = data.map((it) => ({
    data: it.address + formatNumber(it.amount) + formatNumber(it.index),
    ...it,
}));

const leaves = data.map((v) => keccak256(v.data));
const tree = new MerkleTree(leaves, keccak256, {sort: true});
const root = tree.getHexRoot();

exports.getRoot = function () {
    return root;
};

exports.getProof = function (index) {
    const proof = tree.getHexProof(keccak256(data[index].data));
   // console.log(proof);

    return {proof, ...data[index]};
};

// console.log("root:");
// console.log(root);
// console.log("");
// console.log("");


let list = [];
for (i = 0; i < data.length; i++) {
    const proof = tree.getHexProof(keccak256(data[i].data));
    list.push({proof: proof, index: i});
}
console.log(JSON.stringify(list));
console.log("");
console.log("");
console.log("");


fs.writeFile('./json.txt', JSON.stringify(list), function(err) {
    if(err) {
        return console.log(err);
    }
});



