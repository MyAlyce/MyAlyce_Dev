import classNames from 'classnames';
import React from 'react';
import type { Size } from '../../general.types';
import { spinnersSvg } from './SpinnerIcons';

export const spinnerSizeMap = {
    xs: 'h-6 w-6', sm: 'h-9 w-9', md: 'h-16 w-16', lg: 'h-32 w-32', xl: 'h-64 w-64', auto: 'h-full w-full'
} as const;

export type SpinnerProps = {
    /** If not set or set to `"auto"` will automatically fill the available space */
    size?: Size | 'auto';
    type?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 'pulse';
    className?: string;
}

export const Spinner = ({ type = 1, size = 'auto', className }: SpinnerProps) => <div className={classNames("overflow-hidden", className, spinnerSizeMap[size])}>
    {type === 'pulse' ?
        <div className="bg-secondary-300 h-full w-full animate-pulse" />
        :
        <img src={`data:image/svg+xml;utf8,${spinnersSvg[type - 1]}`} className="animate-spin h-full w-full" />
    }
</div>;