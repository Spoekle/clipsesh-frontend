import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-neutral-950 w-full text-white py-4 text-center">
            <p className="text-sm">
                © {new Date().getFullYear()} Spoekle. All rights reserved.
                <Link to="/privacystatement" className='ml-2 underline'>
                    Privacy Statement
                </Link>
            </p>
        </footer>
    );
}

export default Footer;