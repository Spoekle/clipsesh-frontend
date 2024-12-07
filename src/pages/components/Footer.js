import React from 'react';
import { Link } from 'react-router-dom';
import { FaDiscord, FaGithub, FaYoutube } from 'react-icons/fa';

function Footer() {
    return (
        <footer className="flex bg-neutral-900 w-full justify-between text-white py-6 text-center">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <p className="flex text-md">
                    © {new Date().getFullYear()} Spoekle. All rights reserved.
                    <Link to="/privacystatement" className='ml-2 underline'>
                        Privacy Statement
                    </Link>
                </p>
                <div className="flex">
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
                </div>
            </div>
        </footer>
    );
}

export default Footer;