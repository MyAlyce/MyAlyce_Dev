import React, { HTMLProps, useState } from 'react';

export type ToggleInputProps = {
    onChange: (toggled: boolean) => any;
    label?: string;
} & HTMLProps<HTMLInputElement>

export const Toggle = ({ onChange, label, ...props }: ToggleInputProps) => {
    const [isChecked, setIsChecked] = useState(false);

    return <div className="flex flex-col">
        <label className="mt-3 inline-flex items-center cursor-pointer">
        <span className="relative">
            <span className={`block w-10 h-6 rounded-full shadow-inner ${isChecked ? 'bg-primary-300' : 'bg-secondary-200'}`}></span>
            <span className={`absolute block w-4 h-4 mt-1 ml-1 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transition-transform duration-300 ease-in-out ${isChecked ? 'transform translate-x-full bg-secondary-300' : 'bg-secondary-400'}`}>
            <input
                {...props}
                type="checkbox"
                className="absolute opacity-0 w-0 h-0"
                onChange={(x) => {
                    setIsChecked(x.target.checked);
                    onChange(x.target.checked);
                }}
            />
            </span>
        </span>
        {label && <span className="ml-3 text-sm">{label}</span>}
        </label>
    </div>;
};