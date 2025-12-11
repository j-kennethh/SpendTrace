import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-6 text-center text-xs text-muted-foreground mt-auto">
            <p>&copy; {currentYear} John Kenneth Agpaoa. All rights reserved.</p>
        </footer>
    );
}
