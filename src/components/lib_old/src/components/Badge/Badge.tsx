import { isType } from '@giveback007/util-lib';
import classNames from 'classnames';
import React from 'react';
import type { Size } from '../../general.types';

// TODO: inline badges

export type BadgeProps = {
    size: Size,
    badge?:  boolean | number,
    className?: string;
};

const badgeSize = { xs: 'h-2 min-w-2', sm: 'h-3 min-w-3', md: 'h-4 min-w-4', lg: 'h-6 min-w-6', xl: 'h-12 min-w-12' } as const;
const badgeFontSize = { md: 'text-xs', lg: 'text-base', xl: 'text-2xl' } as const;
/** To be contained within parent component: parent must be set to `position: relative;`.
 * 
 * In `xs` & `sm` mode it will not display the number. If the number is `> 999` it will say `+999`
 */
export const Badge = ({ size, badge, className }: BadgeProps) =>
    badge ? <div className={classNames(
        'bg-info-600 rounded-full absolute top-0 right-0 pl-1 pr-1 flex justify-center text-gray-100',
        badgeSize[size],
        className
    )}>
        {(isType(badge, 'number') && size !== 'sm' && size !== 'xs') && <span className={`m-auto ${badgeFontSize[size]}`}>{badge > 999 ? '+999' : badge}</span>}
    </div> : null;
    