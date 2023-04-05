import classNames from 'classnames';
import React, { PropsWithChildren, useState } from 'react';
import type { ColorTypes, ComponentBase, ObjMap, Size } from '../../general.types';
import { Badge } from '../Badge/Badge';

export type ButtonProps = PropsWithChildren<{
  /** Size of the button, choose `'auto'` to have the button fit the container. Default: `'md'` */
  size?: Size | 'auto';
  /** Choose a color type for the button. Default: `'secondary'` */
  type?: ColorTypes;
  /** Choose either rounded or flat button. Default: `'round'` */
  shape?: 'round' | 'flat';
  /** Button will have no background, only border. Default: `false` */
  outline?: boolean;
  onClick?: () => any;
  /** Can add a badge to the button */
  badge?: number | boolean;
  disabled?: boolean;

  /** Allows to set the button html type. Default: `"button"` */
  htmlType?: 'reset' | 'submit' | 'button';
}> & ComponentBase;


const buttonSizeMap: ObjMap<Size | 'auto'> = { xs: 'text-xs p-0.5 px-1', sm: 'text-sm p-1 px-2', md: 'text-base p-1.5 px-3', lg: 'text-lg p-2 px-4', xl: 'text-xl p-2.5 px-5', auto: 'p-1.5 text-base h-full w-full'};
const buttonColorMap: ObjMap<ColorTypes> = { primary: 'bg-primary-500', secondary: 'bg-secondary-500', success: 'bg-success-500', info: 'bg-info-500', danger: 'bg-danger-500', warning: 'bg-warning-500'};
const buttonHoverMap: ObjMap<ColorTypes> = { primary: 'hover:bg-primary-600', secondary: 'hover:bg-secondary-600', success: 'hover:bg-success-600', info: 'hover:bg-info-600', danger: 'hover:bg-danger-700', warning: 'hover:bg-warning-600'};
const buttonBorderMap: ObjMap<ColorTypes> = { primary: 'border-primary-500 text-primary-500', secondary: 'border-secondary-500 text-secondary-500', success: 'border-success-500 text-success-500', info: 'border-info-500 text-info-500', danger: 'border-danger-500 text-danger-500', warning: 'border-warning-500 text-warning-500'};
const buttonBadgeMap: ObjMap<Size | 'auto', Size> = { xs: 'xs', sm: 'sm', md: 'md', lg: 'md', xl: 'lg', auto: 'md' };

export const Button = ({
  size = 'md', type = 'secondary', shape = 'round',
  outline = false, badge, className, disabled, children,
  htmlType = "button", ...props
}: ButtonProps) => {
  const [isHover, setIsHover] = useState(false);

  return (
    <button
      type={htmlType}
      className={classNames(
        "relative text-gray-100 font-normal border-2 transition-all",
        buttonSizeMap[size],
        outline && !isHover ? buttonBorderMap[type] : buttonColorMap[type] + ' border-transparent',
        shape === 'flat' ? 'rounded-none' : 'rounded-lg',
        disabled && 'opacity-60',
        !disabled && buttonHoverMap[type],
        className,
      )}
      onMouseEnter={() => setIsHover(disabled ? false : true)}
      onMouseLeave={() => setIsHover(false)}
      disabled={disabled}
      {...props}
    >
      {badge && <Badge size={buttonBadgeMap[size]} badge={badge} className={size === 'xs' || size === 'sm' ? '-top-1.5 -right-1.5' : '-top-2 -right-3'} />}
      {children}
    </button>
  );
};
