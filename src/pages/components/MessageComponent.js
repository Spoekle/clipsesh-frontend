import React, { useState, useEffect } from 'react';
import { AiOutlineSend, AiOutlineDelete } from 'react-icons/ai';
import axios from 'axios';

const MessageComponent = ({ clipId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://api.spoekle.com/api/messages?clipId=${clipId}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();

    const intervalId = setInterval(fetchMessages, 10000); // Fetch every 10 seconds

    return () => clearInterval(intervalId);
  }, [clipId]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('https://api.spoekle.com/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };
    fetchUser();
  }, []);

  const handleSendMessage = async () => {
    try {
      const response = await fetch(`https://api.spoekle.com/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clipId, userId: user._id, user: user.username, message: newMessage })
      });
      const newMsg = await response.json();
      setMessages((prevMessages) => [...prevMessages, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      const response = await fetch(`https://api.spoekle.com/api/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user._id, isAdmin: user.isAdmin })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== id));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="message-container bg-gray-200 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Chat:</h2>
      <div className="messages bg-gray-100 p-2 rounded-lg overflow-y-scroll h-64">
        {messages.map((msg) => (
          <div key={msg._id} className="message mb-2 flex justify-between items-center">
            <p>
              <strong>{msg.user}</strong>: {msg.message}
            </p>
            {user && (user.isAdmin || user._id === msg.userId) && (
              <button onClick={() => handleDeleteMessage(msg._id)} className="text-red-500 ml-2">
                <AiOutlineDelete size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="send-message mt-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow p-2 rounded-l-lg border"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-2 rounded-r-lg flex items-center"
        >
          <AiOutlineSend size={24} />
        </button>
      </div>
    </div>
  );
};

export default MessageComponent;
