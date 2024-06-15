import React, { useState, useEffect } from 'react';
import axios from 'axios';
import background from '../media/background.jpg';
import { BiLoaderCircle } from 'react-icons/bi';
import { LinearProgress } from '@mui/material';

import Navbar from './components/Navbar';

function UploadClip() {
  const [file, setFile] = useState(null);
  const [streamer, setStreamer] = useState('');
  const [clips, setClips] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleStreamerChange = (e) => {
    setStreamer(e.target.value);
  };

  function handleEditStreamerChange(event, clipId) {
    const newClips = clips.map((clip) => {
      if (clip._id === clipId) {
        return { ...clip, streamer: event.target.value };
      } else {
        return clip;
      }
    });

    setClips(newClips);
  }

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('clip', file);
    formData.append('streamer', streamer);

    try {
      const response = await axios.post(
        'https://api.spoekle.com/api/clips/upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        }
      );
      setUploadProgress(0);
      console.log('Upload successful:', response.data);
      fetchClips(); // Assuming fetchClips() fetches the updated list of clips after upload
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
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClips();
    } catch (error) {
      console.error('Error deleting clip:', error);
    }
  };

  const handleStreamerUpdate = async (id) => {
    try {
      const clipToUpdate = clips.find((clip) => clip._id === id);
      const response = await axios.put(
        `https://api.spoekle.com/api/clips/${id}`,
        { streamer: clipToUpdate.streamer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Update successful:', response.data);
      alert('Streamer updated successfully');
      fetchClips();
    } catch (error) {
      console.error('Error updating streamer:', error);
    }
  };

  useEffect(() => {
    fetchClips();
  }, []);

  return (
    <div className="text-white min-h-screen relative bg-cc-blue">
      <div className="relative h-64" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cc-red filter backdrop-blur-md"></div>
      </div>
      <div className='absolute top-0 w-full z-50'>
        <Navbar />
      </div>
      <div className='grid justify-items-center text-white p-4 pt-8 bg-gradient-to-b from-cc-red to-cc-blue justify-center items-center'>
        <div className="container mb-4 p-4 bg-black/30 rounded-md justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Upload Clip</h2>
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              className="mb-2"
            />
          </div>
          <div>
            <input
              type="text"
              value={streamer}
              onChange={handleStreamerChange}
              placeholder="Enter streamer name"
              className="mb-2 px-2 py-1 w-1/2 rounded bg-white text-neutral-800"
            />
          </div>
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleUpload}
          >
            Upload
          </button>
          <div className="mt-4 rounded-full">
            {uploadProgress > 0 && (
              <LinearProgress variant="determinate" value={uploadProgress} />
            )}
          </div>
        </div>
        <div className='container mt-4 bg-black/30 rounded-md'>
          <h2 className="text-3xl font-bold p-4">Existing Clips</h2>
          <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 mb-4">
            {!clips.length ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="overflow-hidden w-full animate-pulse text-center bg-white/30 p-4 rounded-md">
                  <div className="flex justify-center items-center mb-2">
                  <input
                      type="text"
                      placeholder="Streamer"
                      value="Steamer"
                      className="px-2 py-1 rounded bg-neutral-200/30 text-neutral-800/30"
                    />
                    <div
                      className="bg-green-500/30 hover:bg-green-600/30 text-white/30 px-2 py-1 ml-2 rounded"
                    >
                      Update
                    </div>
                  </div>
                  <div className="w-full relative" style={{ paddingTop: '56.25%' }}>
                    <div className="absolute top-0 left-0 w-full h-full rounded-t-md bg-black/30 justify-center items-center flex">
                      <BiLoaderCircle className="animate-spin h-5 w-5 text-white/30 m-auto" />
                    </div>
                  </div>
                  <div
                    className="bg-red-500/30 hover:bg-red-600/30 text-white/30 px-4 py-2 w-full rounded-b-md"
                  >
                    Delete
                  </div>
                </div>
              ))
            ) : (
              clips.map((clip) => (
                <div key={clip._id} className="overflow-hidden w-full text-center bg-white/30 p-4 rounded-md">
                  <div className="flex justify-center items-center mb-2">
                    <input
                      type="text"
                      placeholder={clip.streamer}
                      value={clip.streamer}
                      onChange={(event) => handleEditStreamerChange(event, clip._id)}
                      className="px-2 py-1 rounded bg-neutral-200 text-neutral-800"
                    />
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 ml-2 rounded"
                      onClick={() => handleStreamerUpdate(clip._id)}
                    >
                      Update
                    </button>
                  </div>
                  <video className="w-full rounded-t-md" src={`https://api.spoekle.com${clip.url}`} controls />
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 w-full rounded-b-md"
                    onClick={() => handleDelete(clip._id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadClip;
