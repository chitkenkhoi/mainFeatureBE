const ethers = require('ethers');
require('dotenv').config();
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
const privateKey = process.env.FAUCET_PRIVATEKEY;
const wallet = new ethers.Wallet(privateKey, provider);

const amount = ethers.utils.parseEther('0.2'); // Convert ether to wei
const sendMoney = async (toAddress) => {
    const tx = await wallet.sendTransaction({
        to: toAddress,
        value: amount
    });
    try {
        const receipt = await tx.wait()
        var response = {
            success: true,
            hash: receipt.transactionHash
        }
    } catch (e) {
        console.log(e)
        var response = {
            success: false,
            error: e
        }
    }
    return response
}
module.exports = sendMoney



