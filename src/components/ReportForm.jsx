import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './ReportForm.css';
import { AES } from 'crypto-js';
import contractABI from './Abi.json'

const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const districtOptions = [
  'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
  'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
  'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
];

const ReportForm = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [district, setDistrict] = useState('');
  const [exciseZone, setExciseZone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.web3) {
        const web3Instance = new Web3(window.web3.currentProvider);
        setWeb3(web3Instance);

        const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
        setContract(contractInstance);

        try {
          const accounts = await web3Instance.eth.getAccounts();
          setAccounts(accounts);

          // Add event listener for report submitted event
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

      const photoHash = photo ? 'hash_of_photo_file' : 'bdkchbvhfbvhckfvbjebfvhbhefnjvnefnvjnfkvbhefkebjfsnjlnjcndljjjsdcjbv';
      const videoHash = video ? 'hash_of_video_file' : 'bhbvdwvhbwfvcnsjdnjcvnjsljkDLADHAFHHDBFHBHAVHBFHBVHBFHBVHBFHVJ CJNJV';

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
      setPhoto(null);
      setVideo(null);

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
            Excise Zone:
            <input
              type="text"
              placeholder="Enter Excise Zone"
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
        <button type="submit" className="report-form-button">
          Submit Report
        </button>
      </div>
    </form>
  );
};

export default ReportForm;
