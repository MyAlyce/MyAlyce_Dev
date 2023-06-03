import React, { FunctionComponent, HTMLProps } from 'react';

type RadioProps = {
  label: string;
  disabled: boolean;
} & HTMLProps<HTMLInputElement>

export const Radio: FunctionComponent<RadioProps> = ({ label, disabled ,...props}) => <label className="inline-flex items-center">
  <input
    type="radio"
    name="vehicle"
    className="h-5 w-5 text-red-600"
    disabled={disabled}
    {...props}
  />
      {label && <span className="ml-2 text-gray-700">{label}</span>}
</label>;
