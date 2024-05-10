const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const JWT = process.env.TOKEN

const pinFileToIPFS = async (file) => {
    const formData = new FormData();
    formData.append('file', file, file.name)

    const pinataMetadata = JSON.stringify({
        name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'Authorization': `Bearer ${JWT}`
            }
        });
        console.log("res: ", res.data);
        var response = {
            success: true,
            data: res
        }
    } catch (error) {
        console.log(error);
        var response = {
            success: false,
            error: error
        }
    }
    return response
}
module.exports = pinFileToIPFS
