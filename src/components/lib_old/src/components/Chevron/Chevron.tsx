import React from 'react';
import classNames from "classnames";
import { chevronIcons } from './ChevronIcons';
import type { ComponentBase, ObjMap, Size } from '../../general.types';

export type ChevronProps = {
    direction: 'up' | 'right' | 'down' | 'left';
    icon: keyof typeof chevronIcons;
    size?: Size | 'auto';
} & ComponentBase;

const chevronDirectionMap: ObjMap<ChevronProps['direction']> = { down: 'rotate-0', up: 'rotate-180', left: 'rotate-90', right: '-rotate-90' } as const;
const chevronSizeMap: ObjMap<Size | 'auto'> = {
    xs: 'h-3 w-3', sm: 'h-6 w-6', md: 'h-12 w-12', lg: 'h-24 w-24', xl: 'h-48 w-48', auto: 'h-full w-full'
} as const;
export const Chevron = ({ direction, icon, size = 'auto', className, style }: ChevronProps) => <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0" 
    className={classNames(
        "transform transition-transform duration-500 svg-fix",
        chevronSizeMap[size],
        chevronDirectionMap[direction],
        className
    )}
    viewBox={chevronIcons[icon].viewBox}
    style={style}
>
    {chevronIcons[icon].path}
</svg>;

// TODO fix fill rule