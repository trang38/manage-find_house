import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    href ?: string,
    to ?: string,
    name: string,
    className ?: string,
    variant ?: 'primary' | 'secondary' | 'outline'
}

export default function Button({ href, to, name, className='', variant='primary', ...props }: ButtonProps){
    if (href) {
        return (
            <a href={href} className={className} target='_blank' rel='noopener noreferrer' {...props as any}>
                { name }
            </a>
        )
    }
    if (to) {
        return (
            <Link to={to} className={className} {...props as any}>
                { name }
            </Link>
        )
    }
    return (
        <button className={className} {...props}>
            { name }
        </button>
    )
}