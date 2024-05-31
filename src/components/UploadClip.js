import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UploadClip() {
  const [file, setFile] = useState(null);
  const [streamer, setStreamer] = useState('');
  const [clips, setClips] = useState([]);
  
  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleStreamerChange = (e) => {
    setStreamer(e.target.value);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('clip', file);
    formData.append('streamer', streamer);

    try {
      const response = await axios.post('https://api.spoekle.com/api/clips/upload', formData, {
        headers: 
          { Authorization: `Bearer ${token}` },
          'Content-Type': 'multipart/form-data',
      });
      console.log('Upload successful:', response.data);
      fetchClips();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const fetchClips = async () => {
    try {
      const response = await axios.get('https://api.spoekle.com/api/clips');
      setClips(response.data);
    } catch (error) {
      console.error('Error fetching clips:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://api.spoekle.com/api/clips/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClips();
    } catch (error) {
      console.error('Error deleting clip:', error);
    }
  };

  const handleDeleteAllClips = async () => {
    try {
      await axios.delete('https://api.spoekle.com/api/clips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClips();
      console.log('All clips deleted successfully');
    } catch (error) {
      console.error('Error deleting all clips:', error);
    }
  };

  useEffect(() => {
    fetchClips();
  }, []);

  return (
    <div className="bg-gray-900 text-white p-4 min-h-screen">
      <h2 className="text-xl font-bold mb-4">Upload Clip</h2>
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-2"
        />
        <input
          type="text"
          value={streamer}
          onChange={handleStreamerChange}
          placeholder="Enter streamer name"
          className="mb-2 px-2 py-1 rounded bg-gray-800 text-white"
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 ml-2 rounded"
          onClick={handleUpload}
        >
          Upload
        </button>
      </div>
      <h2 className="text-xl font-bold mb-2">Existing Clips</h2>
      <div className="flex flex-wrap">
        {clips.map((clip) => (
          <div key={clip._id} className="w-1/4 px-2 mb-4">
            <h3 className="text-lg font-bold">{clip.streamer}</h3>
            <video className="w-full rounded-t-md" src={`https://api.spoekle.com${clip.url}`} controls />
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 w-full rounded-b-md"
              onClick={() => handleDelete(clip._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <button
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 mt-4 rounded-md"
        onClick={handleDeleteAllClips}
      >
        Reset Database
      </button>
    </div>
  );
}

export default UploadClip;
