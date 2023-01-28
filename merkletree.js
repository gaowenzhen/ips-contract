const { MerkleTree } = require("merkletreejs");
const Web3 = require("web3");
const SHA256 = require("crypto-js/SHA256");

const web3 = new Web3("https://bsc-dataseed.binance.org");
const leaves = [
  "0x4A04A4e16831a1e02928EF8ec534B27b183574CB",
  "0xbe2Fe5AF9C42Ad8780eb19F225965CE8602bF65d",
  "0x573e94bBD4BFdb5dF0889fA33a671b524183A80c",
  "0x9846F765156d444aB9768Be724B45B06F272FfCc",
  "0x7Add17EAF26b7B8bBE20443911670F7310355FA3",
  "0x19aDa4b335B601CCCbD06C8d2ADC497a6E6660EF",
  "0x9824952061C4Af5744B623c4FAAB527Bf2a81ADD",
  "0x4A04A4e16831a1e02928EF8ec534B27b183574CB"
].map((x) => web3.utils.sha3(x));
const tree = new MerkleTree(leaves, web3.utils.sha3,{sort: true});
console.log("leaves::::", leaves);
// console.log("tree::::", tree);
const root = tree.getRoot();
const root_hash = tree.getHexRoot();
console.log("root_hash::::", root_hash);
const leaf = web3.utils.sha3("0x4A04A4e16831a1e02928EF8ec534B27b183574CB");

console.log("leaf:::", leaf);
const proof = tree.getProof(leaf);
// console.log("proof:::", proof);
const proof1 = tree.getHexProof(leaf);
console.log("proof1:::", proof1);
console.log(tree.verify(proof, leaf, root_hash)); //true
let leaf_test = leaf;

 for (let i = 0;  i < proof1.length;i++) {
    let hash_cal
    let bytes
     if (proof1[i] > leaf_test) {
        bytes = proof1[i] + leaf_test.slice(2)
        hash_cal =  web3.utils.sha3(bytes)
     }else {
        bytes = leaf_test + proof1[i].slice(2)
        hash_cal =  web3.utils.sha3(bytes)
     }
     console.log("bytes:::",bytes)
     console.log("hash_cal:::",hash_cal)

    leaf_test = hash_cal
 }


const leaf1 = web3.utils.sha3(
  "0xbe2Fe5AF9C42Ad8780eb19F225965CE8602bF65d" + "31"
);
console.log("leaf1:::", leaf1.toString());
const leaf2 = web3.utils.sha3(
  "0x573e94bBD4BFdb5dF0889fA33a671b524183A80c" + "31"
);
console.log("leaf2:::", leaf2.toString());
const leaf3 = web3.utils.sha3(
  "0x9846F765156d444aB9768Be724B45B06F272FfCc" + "31"
);
console.log("leaf3:::", leaf3.toString());
const leaf4 = web3.utils.sha3(
  "0x7Add17EAF26b7B8bBE20443911670F7310355FA3" + "31"
);
console.log("leaf4:::", leaf4.toString());
const proof2 = tree.getProof(leaf);
console.log(tree.verify(proof2, leaf1, root)); //true
const effi_hash = web3.utils.sha3("0x9777accb14d208a684cba7e1753cec3186ca55f6f0bf00f588d70a9ef90f929df2b307c36795e83c2ecf047b1f111d128fd61c4b30842d4410fb5fab112b4cfe")
console.log("effi_hash:::",effi_hash);

//function_verify(
//bytes32[]calldatamerkleProof,
//addresssender,
//uint256maxAmount
//)privateviewreturns(bool){
//bytes32leaf=keccak256(abi.encodePacked(sender,maxAmount.toString()));
//returnMerkleProof.verify(merkleProof,merkleRoot,leaf);
//}

//functionverify(
//bytes32[]memoryproof,
//bytes32root,
//bytes32leaf
//)internalpurereturns(bool){
//returnprocessProof(proof,leaf)==root;
//}

[
  "0x0d3601f6282e4fb6f6b2b52574cc00eb63a4ea1a1906bdae85d04127ec1fbcb8",
  "0x20e191fff4d916c934171f58acbf2a9ba102b8b77dce1ade6cf5fa1a641a2fe0",
  "0xc855d187944ea34f924c8ea056a4cee13233184c8f52ad92cdce84abc9df674c"
]

