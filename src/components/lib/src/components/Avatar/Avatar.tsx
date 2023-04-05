import { isType } from '@giveback007/util-lib';
import React, { MouseEventHandler, useState } from 'react';
import type { DataState, Size } from '../../general.types';
import { Badge } from '../Badge/Badge';
import classNames from 'classnames';

const sizeMap = {
    xs: 'h-6 w-6', sm: 'h-9 w-9', md: 'h-16 w-16', lg: 'h-32 w-32', xl: 'h-64 w-64', auto: 'h-full w-full'
} as const;

import { Spinner } from '../Spinner/Spinner';

export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export type AvatarProps = {
    dataState: DataState;
    imgSrc?: string;
    name?: { first: string, last: string } | string;
    backgroundColor?: string;
    status?: AvatarStatus;
    badge?: boolean | number;
    size: Size;
    onClick?: MouseEventHandler;
    className?: string;
};

export const Avatar = (p: AvatarProps) => {
    const { dataState, imgSrc, backgroundColor, status, badge, size, onClick, className } = p;
    
    const name = (() => {
        if (dataState === 'loading' || dataState === 'error')
            return dataState === 'error' ? "Couldn't Load User" : dataState === 'loading' ? 'Loading...' : '';
        
        if (isType(p.name, 'string') || !p.name)
            return p.name || '';
            
        const { first, last } = p.name;
        return `${first} ${last}`;
    })();
    
    return <div
        onClick={onClick}
        className={classNames(`
            flex relative justify-center items-center
            m-1 mr-2 rounded-full text-white`,
            sizeMap[size],
            !(backgroundColor || dataState === 'loading') &&'bg-secondary-500',
            dataState === 'loading' && ' overflow-hidden',
            onClick && 'cursor-pointer',
            className
        )}
        title={dataState === 'error' ? "Couldn't Load User" : dataState === 'loading' ? 'Loading...' : name}
        style={{ backgroundColor }}
    >
        <AvatarInner {...{ dataState, imgSrc, badge, size, status, name }} />
    </div>;
};

export type AvatarInnerProps = {
    dataState: DataState,
    size: Size;
    imgSrc?: string,
    status?: AvatarStatus,
    badge?: boolean | number, name: AvatarProps['name']
}

const avatarFontSize = { xs: 'text-sm', sm: 'text-xl', md: 'text-4xl', lg: 'text-7xl', xl: 'text-9xl' } as const;
export const AvatarInner = (p: AvatarInnerProps) => {
    if (p.dataState === 'loading') return <Spinner size='auto' type='pulse' />;
    if (p.dataState === 'error') return <img src={`data:image/svg+xml;utf8,${avatarErr}`} className='rounded-full h-full w-full' />;

    const { imgSrc, status, badge, size, name = '' } = p;
    const [imgStatus, setImgStatus] = useState<'loading' | 'error' | 'success'>(imgSrc ? 'loading' : 'error');

    const initials = isType(name, 'string') ? name.substring(0, 2) : `${name.first[0].toUpperCase()}${name.last[0].toUpperCase()}`;

    return <>
        {/* Badge */}
        <Badge size={size} badge={badge} />
        
        {/* User image */}
        {imgStatus === 'error' ? 
            <span className={avatarFontSize[size]}>{initials}</span>
            :
            <img
                className="rounded-full h-full w-full"
                src={imgSrc}
                onLoad={() => setImgStatus('success')}
                onError={() => setImgStatus('error')}
            />
        }

        {/* Status */}
        {status && <Status size={size} status={status} />}
    </>;
};



const statusSize = { xs: 'h-2 w-2', sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-6 w-6', xl: 'h-12 w-12' } as const;
const statusColor = { online: 'bg-success-500', offline: 'bg-danger-500', busy: 'bg-warning-500', away: 'bg-secondary-500' };
const Status = (p: { size: Size, status: AvatarStatus }) => <span className="flex absolute bottom-0 right-0">
    {p.status === 'online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>}
    <span className={`relative inline-flex rounded-full ${statusColor[p.status]} ${statusSize[p.size]}`}></span>
</span>;

const avatarErr = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353L4.54.146zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1H5.1z"/><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/></svg>`;