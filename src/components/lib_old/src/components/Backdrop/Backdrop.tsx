import classNames from 'classnames';
import React, { MouseEventHandler, useEffect, useState } from 'react';
import type { ComponentBase } from '../../general.types';

export type BackdropProps = {
    zIndex: number;
    onBackdropClick?: MouseEventHandler;
    /** Opacity to transition into when backdrop gets activated. Number between 0 to 100. Default: `40` */
    maxOpacity?: number;

    transition?: boolean;
} & ComponentBase;

export const Backdrop = ({
    zIndex, onBackdropClick, maxOpacity = 40, transition = true,
    style, className
}: BackdropProps) => {
    const [opacity, setOpacity] = useState(!transition);
    useEffect(() => {
        return () => !opacity && setTimeout(() => setOpacity(true), 0) as any
    }, [opacity]);

    return <div
        className={classNames(
            'fixed top-0 left-0 right-0 w-screen h-screen bg-black',
            transition && 'transition-opacity duration-200',
            className
        )}
        style={{ zIndex, opacity: opacity ? Number((maxOpacity / 100).toFixed(2)) : 0, ...style }}
        onClick={onBackdropClick}
    ></div>;
};
