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
    //     string memory _media
    // )////
    // function modifyCompanyInfo(
    //     string memory _name,
    //     string memory _email,
    //     string memory _phone,
    //     string memory _website,
    //     string[] memory _certificateImage,
    //     string memory _address
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
                state.tx = await connector.registerCompany(obj.name, obj.email, obj.taxcode, obj.companytype, obj.phone, obj.website, obj.certificateImage, obj.address);
                break;
            case 'createProduct':
                state.tx = await connector.createProduct(obj.size, obj.unit, obj.name, obj.description, obj.media)
                break;
            case 'writeDiary':
                state.tx = await connector.writeDiary(obj.productId, obj.description, obj.media)
                break;
            case 'modifyCompanyInfo':
                state.tx = await connector.modifyCompanyInfo(obj.name, obj.email, obj.phone, obj.website, obj.certificateImage, obj.address)
                break;
            case 'NextPhase':
                state.tx = await connector.NextPhase(obj.newUser, obj.productId)
                break;
            default:
                return obj
        }
        state.receipt = await state.tx.wait(1)
        const response = {
            success: true,
            hash: state.receipt.transactionHash
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
//     name: "abcdde",
//     email: "a",
//     phone: "1234",
//     website: "a",
//     certificateImage: ["a"],
//     address: "a",
// }
// // Call the function
// callWriteFunction('modifyCompanyInfo', obj, "5059ecb3aa11cc42a01edb445fb85ee9ea2041de1c274b54161c2680bd659030");
