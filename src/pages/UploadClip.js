import React, { useState, useEffect } from 'react';
import axios from 'axios';
import background from '../media/background.jpg';
import placeholder from '../media/placeholder.png';
import banner1 from '../media/banner1.png';
import { BiLoaderCircle } from 'react-icons/bi';
import { LinearProgress } from '@mui/material';
import Pagination from '@mui/material/Pagination';

function UploadClip() {
  const [file, setFile] = useState(null);
  const [streamer, setStreamer] = useState('');
  const [title, setTitle] = useState('');
  const [clips, setClips] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [sortOption, setSortOption] = useState('newest');

  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleStreamerChange = (e) => {
    setStreamer(e.target.value);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
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

  function handleEditTitleChange(event, clipId) {
    const newClips = clips.map((clip) => {
      if (clip._id === clipId) {
        return { ...clip, title: event.target.value };
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
    formData.append('title', title);

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
      fetchClips();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const fetchClips = async () => {
    try {
      const response = await axios.get('https://api.spoekle.com/api/clips');
      sortClips(response.data);
    } catch (error) {
      console.error('Error fetching clips:', error);
    }
  };

  const sortClips = (clipsToSort = clips) => {
    let sortedClips = [...clipsToSort];
    switch (sortOption) {
      case 'newest':
        sortedClips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        sortedClips.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }
    setClips(sortedClips);
    setCurrentPage(1);
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
      fetchClips(currentPage); // Fetch the current page after update
    } catch (error) {
      console.error('Error updating streamer:', error);
    }
  };

  const handleTitleUpdate = async (id) => {
    try {
      const clipToUpdate = clips.find((clip) => clip._id === id);
      const response = await axios.put(
        `https://api.spoekle.com/api/clips/${id}`,
        { title: clipToUpdate.title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Update successful:', response.data);
      alert('Title updated successfully');
      fetchClips(currentPage);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  useEffect(() => {
    fetchClips();
  }, []);

  useEffect(() => {
    sortClips(clips);
  }, [sortOption]);

  const indexOfLastClip = currentPage * itemsPerPage;
  const indexOfFirstClip = indexOfLastClip - itemsPerPage;
  const currentClips = clips.slice(indexOfFirstClip, indexOfLastClip);

  const totalPages = Math.ceil(clips.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="text-white min-h-screen relative">
      <div className="flex h-96 justify-center items-center" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
        <div className="flex bg-white/20 backdrop-blur-lg justify-center items-center w-full h-full">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold mb-4 text-center">Clip Uploads</h1>
            <h1 className="text-3xl mb-4 text-center">Upload and alter clips!</h1>
          </div>
        </div>
      </div>
      <div className='grid justify-items-center text-white bg-neutral-200 dark:bg-neutral-900 p-4 pt-8 justify-center items-center'>
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
              className="w-full mb-2 px-2 py-1 rounded bg-white text-neutral-800"
            />
          </div>
          <div>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter title"
              className="w-full mb-2 px-2 py-1 rounded bg-white text-neutral-800"
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
      </div>
      <div className='grid justify-items-center text-white p-4 pt-8 bg-neutral-200 dark:bg-neutral-900 transition duration-200 justify-center items-center'>
        <div className="text-center py-4 justify-center items-center z-30">
          <div className="pb-4 flex justify-center">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white transition duration-200 py-2 px-4 rounded-md border-2 border-neutral-800 dark:border-white"
            >
              <option value="newest">Newest Clips</option>
              <option value="oldest">Oldest Clips</option>
            </select>
          </div>
        </div>
        <div className="container mt-4 justify-center items-center rounded-md" style={{ backgroundImage: `url(${banner1})`, backgroundSize: 'cover' }}>
          <div className='h-full w-full bg-white/20 backdrop-blur-lg rounded-md'>
            <h2 className="p-4 text-center text-neutral-800 bg-white dark:bg-neutral-800 dark:text-white transition duration-200 backdrop-blur-sm rounded-t-md text-2xl font-bold drop-shadow-md mb-4">Existing Clips</h2>
            <div className="flex justify-center">
              <div className="items-center bg-white justify-center rounded-md py-2 px-4">
                <Pagination
                  showFirstButton showLastButton
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, page) => paginate(page)}
                />
              </div>
            </div>
            <div className="justify-center grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {!clips.length ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="p-4 relative animate-pulse drop-shadow-md">
                    <div className="flex justify-center items-center mb-2">
                      <input
                        type="text"
                        placeholder={"Cube Community"}
                        value={"Cube Community"}
                        className="px-2 py-1 rounded bg-neutral-200 text-neutral-800"
                      />
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 ml-2 rounded"
                      >
                        Update
                      </button>
                    </div>
                    <div className="flex justify-center items-center mb-2">
                      <input
                        type="text"
                        placeholder={"Cube Community"}
                        value={"Cube Community"}
                        className="px-2 py-1 rounded bg-neutral-200 text-neutral-800"
                      />
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 ml-2 rounded"
                      >
                        Update
                      </button>
                    </div>
                    <div className='rounded-t-lg bg-white dark:bg-neutral-800 transition duration-200 p-2'>
                      <img src={placeholder} alt="Logo" className="w-full rounded-t-lg border-8 border-white opacity-50" />
                    </div>
                    <div className="bg-red-500/30 hover:bg-red-600/30 text-white/30 px-4 py-2 w-full rounded-b-md">
                      Delete
                    </div>
                  </div>
                ))
              ) : (
                currentClips.length > 0 ? (
                  currentClips.map((clip) => (
                    <div key={clip._id} className="p-4 relative animate-fade drop-shadow-md">
                      <div className="overflow-hidden w-full text-center relative">
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
                        <div className="flex justify-center items-center mb-2">
                          <input
                            type="text"
                            placeholder={clip.title}
                            value={clip.title}
                            onChange={(event) => handleEditTitleChange(event, clip._id)}
                            className="px-2 py-1 rounded bg-neutral-200 text-neutral-800"
                          />
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 ml-2 rounded"
                            onClick={() => handleTitleUpdate(clip._id)}
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
                    </div>
                  ))
                ) : (
                  <div className="text-center text-lg">No clips found</div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadClip;
