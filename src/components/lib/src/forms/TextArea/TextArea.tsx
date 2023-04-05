import type { UseFormRegisterReturn } from 'react-hook-form';
import React, { HTMLProps } from 'react';
import { TextInputBorderMap } from '../../utils';
import classNames from 'classnames';

export type TextAreaProps = {
    validation?: 'default' | 'success' | 'warning' | 'danger';
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    labelType?: 'default' | 'row:2/5' | 'row:1/3' | 'row:1/4' | 'addon';

    /**
     * This will only be applied when a label is present, allowing to style the input when it's embedded.
     * Otherwise `className` will be applied.
     */
    inputClassName?: string;

    /** Allows to register input for `react-hook-form` */
    register?: UseFormRegisterReturn;
} & HTMLProps<HTMLTextAreaElement>;

export function TextArea ({
    validation = 'default', className,
    label, labelType = 'default', inputClassName,
    register, ...props
}: TextAreaProps) {
    const lbType = label && labelType;
    
    const textarea = <textarea
        alt={label}
        {...props}
        className={classNames(
            "px-3 py-1.5 outline-0 border w-full rounded-r-sm",
            TextInputBorderMap[validation],
            props.disabled && 'bg-secondary-200',
            lbType !== 'addon' && 'rounded-l-sm',
            !label ? className : inputClassName,
        )}
    />;

    return label ? <div className={classNames(
        'flex',
        lbType === 'default' ? 'flex-col' : 'flex-row',
        className
    )}>
        {label && <div
            className={classNames(
                'flex',
                lbType === 'default' && 'pb-2',
                lbType === 'row:1/3' && 'w-1/3',
                lbType === 'row:1/4' && 'w-1/4',
                lbType === 'row:2/5' && 'w-2/5',
                lbType === 'addon' && 'border border-secondary-400 rounded-l-sm py-0.5 px-3 bg-secondary-200 text-secondary-500'
            )}
        >
            <span className={classNames(lbType !== 'default' && 'm-auto')}>{label}</span>
        </div>}
        {textarea}
    </div> : textarea;
}
