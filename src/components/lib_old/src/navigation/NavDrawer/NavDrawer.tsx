import React, { MouseEventHandler, PropsWithChildren, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { isType } from '@giveback007/util-lib';
import { Avatar } from '../../components/Avatar/Avatar';
import { Backdrop } from '../../components/Backdrop/Backdrop';
import type { ComponentBase, jsx_ } from '../../general.types';
import { customScrollBar } from '../../utils';

// TODO:
  // use width & ellipsis (for too long items)
  // icon-mode (check tailwind media)

export type NavDrawerProps = {
    /** Set NavBar to position fixed at the `left` or `right` of screen. Default: `false` */
    fixed?: 'left' | 'right' | false;

    zIndex?: number;

    brand?: jsx_ | string

    user?: {
        imgSrc?: string;
        name: { first: string, last: string } | string;
        backgroundColor?: string;
    }

    /** Function to handle clicks on brand at the top of navbar */
    onBrandClick?: MouseEventHandler;

    /** Function to handle clicks on user avatar at the top of navbar */
    onAvatarClick?: MouseEventHandler;

    /** Function to handle clicks on menu backdrop at the top of navbar */
    onBackdropClick?: MouseEventHandler;

    /** Define menu items */
    menuItems: (MenuSubmenu | MenuAction | MenuSection | MenuBreak)[];

    isOpen: boolean;

    // className?: string;
} & ComponentBase;

export const NavDrawer = ({
    brand, fixed = false, zIndex = 1002, user, onBrandClick,
    onAvatarClick, onBackdropClick, menuItems, isOpen,
    className, style
}: NavDrawerProps) => <>{fixed && isOpen && <Backdrop {...{ onBackdropClick, zIndex: zIndex - 1 }} />}<div
    className={classNames(`
        flex flex-col bg-white
        dark:bg-gray-800 dark:border-gray-600
        shadow text-secondary-600 w-64
        transition-all duration-500`,
        fixed && 'h-screen fixed top-0 ' + (fixed === 'left' ? 'left-0' : 'right-0'),
        fixed && [
            !isOpen && fixed === 'left' && '-translate-x-full',
            !isOpen && fixed === 'right' && 'translate-x-full',
        ],
        customScrollBar,
        className,
    )}
    style={{zIndex, ...style}}
    // overflow-y-auto overflow-x-hidden
    // scrollbar-thin scrollbar scrollbar-thumb-custom scrollbar-track-custom-light overflow-y-scroll
    >
    {brand && <div
        className={classNames('border-b border-secondary-200 px-2 py-1.5', onBrandClick && 'cursor-pointer')}
        onClick={onBrandClick}
    >
        {isType(brand, 'string') ? <h2
            className={classNames("text-3xl font-semibold text-gray-800 dark:text-white")}
        >{brand}</h2> : brand}
    </div>}

    {user && <div
        className={classNames("flex items-center border-b border-secondary-200 pl-1.5 py-2", onAvatarClick && 'cursor-pointer')}
        onClick={onAvatarClick}
    >
        <Avatar dataState='done' size='sm' {...user} />
        <h4 className="ml-1 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            {user.name}
        </h4>
    </div>}

    <div className="flex flex-col justify-between flex-1">
        <nav className='px-1.5'>
            {menuItems.map((item, i) => <MenuItem {...item} key={i} />)}
        </nav>
    </div>
</div></>;

type MenuItem = {
    title: string;
    icon?: jsx_;
}

type MenuSubmenu = {
    type: 'sub-menu';
    subMenu: MenuItemProps[];
} & MenuItem;

type MenuAction = {
    type: 'action';
    onClick?: MouseEventHandler;
    /** "active" means the menu item is highlighted. */
    isActive?: boolean;

    title: string | ReactElement;
    icon?: jsx_;
};

type MenuSection = {
    type: 'section';
    title: string;
}

type MenuBreak = {
    type: 'break';
}

const MenuItemWrap = ({ children, isActive, getHeight, ...props }: PropsWithChildren<{
    onClick?: MouseEventHandler;
    isActive?: boolean;
    getHeight?: (height: number) => any;
    // ref?: RefObject<HTMLDivElement>
}>) => <div
    className={classNames(`
        flex items-center
        my-1 px-4 py-2 rounded-md
        text-gray-600 dark:text-gray-400
    `, 
    props.onClick && 'cursor-pointer',
    isActive ?
        'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
        :
        'hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'
    )}
    {...props}
>{children}</div>;

type MenuItemProps = MenuSubmenu | MenuAction | MenuSection | MenuBreak;
const MenuItem = (p: MenuItemProps) => {
    // let onClick: MouseEventHandler | undefined = undefined;
    
    switch (p.type) {
        case 'action': {
            const { isActive, icon, title, onClick } = p;
            
            return isType(title, 'string') ? <MenuItemWrap {...{ isActive, onClick }}>
                {icon && icon}
                <span className="mx-4 font-medium">{title}</span>
            </MenuItemWrap> : title;
        }
        case 'break':
            return <hr className="my-1 dark:border-gray-600" />;
        case 'section':
            return <div className='
                overflow-hidden my-1 py-2
                text-gray-600 dark:text-gray-400
            '>
                <span className="px-3 font-medium">{p.title}</span>
            </div>;
        case 'sub-menu': {
            const { icon, title, subMenu } = p;
            const [isExpanded, setIsExpanded] = useState(false);

            return <>
                <MenuItemWrap {...{ isActive: isExpanded, onClick: () => setIsExpanded(!isExpanded) }}>
                    {icon && icon}
                    <span className="mx-4 font-medium">{title}</span>
                    <svg
                        className={classNames(
                            'svg-fix transition-transform ml-auto mr-1.5',
                            isExpanded && '-rotate-90'
                        )}
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 16 16"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                        />
                    </svg>
                </MenuItemWrap>

                {/* TODO: .head_arrow {svg { transform: rotate(180deg); }} */}
                <div
                    className={classNames(
                        'overflow-hidden transition-all duration-700',
                        isExpanded ? 'max-h-screen' : 'max-h-0',
                    )}
                >
                    {subMenu.map((item, i) => <MenuItem {...item} key={i}/>)}
                </div>
            </>;
        }
        default:
            console.error(p);
            throw new Error('This type of MenuItem is not implemented.');
    }
};
