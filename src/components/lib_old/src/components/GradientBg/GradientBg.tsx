import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';
import type { ComponentBase } from '../../general.types';

export type GradientBgProps = PropsWithChildren<{
    gradient?: keyof typeof gradients;
    bgGradientFrom?: keyof typeof grFrom;
    bgGradientTo?: keyof typeof grTo;
}> & ComponentBase;

export function GradientBg({
    children, className, style, gradient, bgGradientFrom, bgGradientTo
}: GradientBgProps) {
    const grClassNames = bgGradientFrom && bgGradientTo && gradient && [
        gradients[gradient], grFrom[bgGradientFrom], grTo[bgGradientTo]
    ];
    return <div
        className={classNames(grClassNames, className)}
        style={style}
    >{children}</div>;
}

const gradients = {
    1: 'bg-gradient-to-t',
    2: 'bg-gradient-to-tr',
    3: 'bg-gradient-to-r',
    4: 'bg-gradient-to-br',
    5: 'bg-gradient-to-b',
    6: 'bg-gradient-to-bl',
    7: 'bg-gradient-to-l',
    8: 'bg-gradient-to-tl',
} as const;

const grFrom = {
    slate: 'from-slate-400',
    gray: 'from-gray-400',
    red: "from-red-400",
    pink: "from-pink-400",
    purple: "from-purple-400",
    indigo: "from-indigo-400",
    blue: "from-blue-400",
    cyan: "from-cyan-400",
    teal: "from-teal-400",
    green: "from-green-400",
    lime: "from-lime-400",
    yellow: "from-yellow-400",
    amber: "from-amber-400",
    orange: "from-orange-400",
    brown: "from-brown-400",
    grey: "from-grey-400",
    emerald: 'from-emerald-400',
    rose: 'from-rose-400',
} as const;

const grTo = {
    slate: 'to-slate-900',
    gray: 'to-gray-900',
    red: "to-red-900",
    pink: "to-pink-900",
    purple: "to-purple-900",
    indigo: "to-indigo-900",
    blue: "to-blue-900",
    cyan: "to-cyan-900",
    teal: "to-teal-900",
    green: "to-green-900",
    lime: "to-lime-900",
    yellow: "to-yellow-900",
    amber: "to-amber-900",
    orange: "to-orange-900",
    brown: "to-brown-900",
    grey: "to-grey-900",
    emerald: 'to-emerald-900',
    rose: 'to-rose-900',
} as const;