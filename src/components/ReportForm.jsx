import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './ReportForm.css';
import { AES } from 'crypto-js';
import contractABI from './Abi.json';
import { create as ipfsHttpClient } from 'ipfs-http-client';
// eslint-disable-next-line
const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const districtOptions = [
  'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
  'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
  'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
];
const projectId = process.env.REACT_APP_INFURA_PROJECT_ID;
const projectSecretKey = process.env.REACT_APP_INFURA_API_KEY;
const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);

const ReportForm = () => {
 
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [district, setDistrict] = useState('');
  const [exciseZone, setExciseZone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState([]);
  const [video, setVideo] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(window.ethereum);
          

          const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
          setContract(contractInstance);

          const accounts = await web3Instance.eth.getAccounts();
          setAccounts(accounts);

          contractInstance.events.ReportSubmitted((error, event) => {
            if (error) {
              console.error('Error processing event:', error);
            } else {
              const reportId = event.returnValues.reportId;
              console.log('Report submitted with ID:', reportId);
              // Perform any necessary actions with the submitted report
              // You can update the UI or fetch the report details using `getReport` function
            }
          });
        } catch (error) {
          console.error('Failed to connect to MetaMask:', error);
        }
      } else {
        console.error('Web3 not found. Please install MetaMask to interact with the Ethereum network.');
      }
    };

    initializeWeb3();
  }, []);

  const encryptData = (data) => {
    const encryptedData = AES.encrypt(data, encryptionKey).toString();
    return encryptedData;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const submitter = accounts[0];

      setUploading(true);
      setUploadSuccess(false);

      const ipfs = ipfsHttpClient({
        url: "https://ipfs.infura.io:5001/api/v0",
        headers: {
          authorization
        }
      });

      let photoHash = null;
      let videoHash = null;

      if (photo) {
        const photoUpload = await ipfs.add(photo);
        photoHash = "https://crs.infura-ipfs.io/ipfs/" + photoUpload.cid.toString();
        console.log(photoHash);
      }

      if (video) {
        const videoUpload = await ipfs.add(video);
        videoHash = "https://crs.infura-ipfs.io/ipfs/" + videoUpload.cid.toString();
      }

      setUploading(false);
      setUploadSuccess(true);

      await contract.methods
        .submitReport(
          encryptData(district),
          encryptData(exciseZone),
          encryptData(title),
          encryptData(description),
          encryptData(photoHash),
          encryptData(videoHash)
        )
        .send({ from: submitter });

      setDistrict('');
      setExciseZone('');
      setTitle('');
      setDescription('');
      setPhoto([]);
      setVideo([]);
      setUploadSuccess(false);

      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('An error occurred while submitting the report. Please try again.');
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    setPhoto(file);
  };

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    setVideo(file);
  };

  return (
    <form onSubmit={handleSubmit} className="report-form-container">
      <div className="report-form">
        <h1 className="report-form-heading">Submit Report</h1>
        <div className="input-container">
          {/* Existing form fields */}
          <label>
            District:
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="report-form-input"
              required
            >
              <option value="" disabled>Select a district</option>
              {districtOptions.map((districtName, index) => (
                <option key={index} value={districtName}>
                  {districtName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Area:
            <input
              type="text"
              placeholder="Enter Your Area"
              value={exciseZone}
              onChange={(e) => setExciseZone(e.target.value)}
              className="report-form-input"
              required
            />
          </label>
          <label>
            Title:
            <input
              type="text"
              placeholder="Enter Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="report-form-input"
              required
            />
          </label>
          <label>
            Description:
            <textarea
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="report-form-input"
              required
            />
          </label>
          <label>
            Photo:
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="report-form-input"
            />
          </label>
          <label>
            Video:
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="report-form-input"
            />
          </label>
        </div>
        {uploading && <p>Uploading...</p>}
        {uploadSuccess && <p>Upload Successful &#10003;</p>}
        <button type="submit" className="report-form-button">
          Submit Report
        </button>
      </div>
    </form>
  );
};

export default ReportForm;
