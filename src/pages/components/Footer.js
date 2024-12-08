import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaDiscord, FaGithub, FaYoutube, FaSun, FaMoon } from 'react-icons/fa';

function Footer() {

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme !== 'light';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <footer className="flex bg-neutral-900 w-full justify-between text-white py-6 text-center">
            <div className="container grid md:flex mx-auto px-4 justify-between items-center">
                <p className="flex text-md">
                    © {new Date().getFullYear()} Spoekle. All rights reserved.
                    <Link to="/privacystatement" className='ml-2 underline'>
                        Privacy Statement
                    </Link>
                </p>
                <div className="flex justify-center mt-2 md:mt-0">
                    <a
                        href="https://discord.gg/dwe8mbC"
                        target="_blank"
                        rel="noreferrer"
                        className="mx-2 hover:scale-110 transition duration-200 cursor-pointer"
                    >
                        <FaDiscord className="text-4xl" />
                    </a>
                    <a
                        href="https://www.youtube.com/@CubeCommunity"
                        target="_blank"
                        rel="noreferrer"
                        className="mx-2 hover:scale-110 transition duration-200 cursor-pointer"
                    >
                        <FaYoutube className="text-4xl" />
                    </a>
                    <a
                        href="https://github.com/Spoekle/clipsesh-frontend"
                        target="_blank"
                        rel="noreferrer"
                        className="mx-2 hover:scale-110 transition duration-200 cursor-pointer"
                    >
                        <FaGithub className="text-4xl" />
                    </a>
                    <button onClick={toggleDarkMode} className="mx-2 hover:scale-110 transition duration-200 cursor-pointer">
                        {isDarkMode ? <FaSun className="text-4xl" /> : <FaMoon className="text-4xl" />}
                    </button>
                </div>
            </div>
        </footer>
    );
}

export default Footer;