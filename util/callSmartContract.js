const { ethers } = require('ethers');
const ABI = require('../ABI.json');
require('dotenv').config();
// Connect to Ethereum provider (e.g., Infura)
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);

// Define your Ethereum wallet private key
// const privateKey = 'e9c7d079db2453096afa6246a06e1550c1d8a4afee86b2e9e045933067008a76';

// Load the contract ABI and instantiate the contract object
const contractAddress = process.env.CONTRACTADDRESS;
const contractABI = ABI;
const contract = new ethers.Contract(contractAddress, contractABI, provider);
var data_emit = ""
contract.on("ProductEvent", (product, history, from, to, fromId,toId) => {
    data_emit = product.id.toNumber()
});
// Define the function to call the write function of the smart contract
async function callWriteFunction(func, obj, privateKey) {
    // Connect to wallet using private key
    const wallet = new ethers.Wallet(privateKey, provider);

    // Set up the parameters for the write function
    // function registerCompany(
    //     string memory _name,
    //     string memory _email,
    //     string memory _taxCode,
    //     CompanyType _companyType,
    //     string memory _phone,
    //     string memory _website,
    //     string[] memory _certificateImage,
    //     string memory _address
    // function registerCompany(
    //     string memory _name,
    //     string memory _email,
    //     string memory _taxCode,
    //     CompanyType _companyType,
    //     string memory _phone,
    //     string memory _website,
    //     string[] memory _certificateImage,
    //     string memory _address,
    //     string memory _description,
    //     string memory _logo
    // )
    // )/////////////////
    // function createProduct(
    //     uint256 _size,
    //     string memory _unit,
    //     string memory _name,
    //     string memory _description,
    //     string memory _media,
    //     string memory _QRcode
    // )////////////////////
    // function writeDiary(
    //     uint256 _productId, 
    //     string memory _description,
    //     string memory _media,
    //     string memory _stepName
    // )
    // function modifyCompanyInfo(
    //     string memory _name,
    //     string memory _email,
    //     string memory _phone,
    //     string memory _website,
    //     string[] memory _certificateImage,
    //     string memory _address,
    //     string memory _description,
    //     string memory _logo
    // )
    //  function NextPhase(address _newUser, uint256 _productId)
    // Call the write function
    const state = {
        tx: "",
        receipt: ""
    }
    const connector = contract.connect(wallet)
    try {
        switch (func) {
            case 'registerCompany':
                console.log("run1=============================================")
                console.log(obj, typeof obj.companytype, typeof obj.certificateImage)
                state.tx = await connector.registerCompany(obj.name, obj.email, obj.taxcode, obj.companytype, obj.phone, obj.website, obj.certificateImage, obj.address, obj.description, obj.logo);
                break;
            case 'createProduct':
                console.log("run2=============================================")
                state.tx = await connector.createProduct(obj.size, obj.unit, obj.name, obj.description, obj.media)
                break;
            case 'writeDiary':
                console.log("run3=============================================")
                state.tx = await connector.writeDiary(obj.productId, obj.description, obj.media, obj.stepName)
                break;
            case 'modifyCompanyInfo':
                state.tx = await connector.modifyCompanyInfo(obj.name, obj.email, obj.phone, obj.website, obj.certificateImage, obj.address, obj.description, obj.logo)
                break;
            case 'NextPhase':
                console.log("run5=============================================")
                state.tx = await connector.NextPhase(obj.newUser, obj.productId)
                break;
            default:
                return obj
        }
        state.receipt = await state.tx.wait(1)
        const response = {
            success: true,
            hash: state.receipt.transactionHash,
            data_emit:data_emit
        }
        console.log(response)
        return response
    } catch (error) {
        const response = {
            success: false,
            error: error
        }
        console.log(response)
        return response
    }





    // Wait for the transaction to be mined

}
module.exports = callWriteFunction
// const obj = {
//     name: 'CompanyX',
//     email: 'companyx@gmail.com',
//     // taxcode: '123456',
//     // companytype: 0,
//     phone: '0982923021',
//     website: 'abc.com',
//     certificateImage: ['a', 'b'],
//     address: 'abc',
//     description: 'abc',
//     logo: '1'
// }
const product = {
    size: 5,
    unit: "kg",
    name: "Khoai tây Nhật",
    description: "Khoai tây trồng mùa đông",
    media: "QmPggBjuM8vdQ9i7NPmpQdTZss8xEnjfCbGtxSUZPZmQyS"
}
// Call the function
// callWriteFunction('createProduct', product, "3ff0fead08513f747a0fdc10bd250f635a1d3cb0838e3436b42b7e3f45b1157a");
