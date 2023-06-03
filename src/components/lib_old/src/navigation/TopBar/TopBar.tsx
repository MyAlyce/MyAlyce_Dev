import { isType } from '@giveback007/util-lib';
import classNames from 'classnames';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import type { ComponentBase, jsx_, NavItem } from '../../general.types';

const menuOut = <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z"/>;
const menuIn = <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM115.4 518.9L271.7 642c5.8 4.6 14.4.5 14.4-6.9V388.9c0-7.4-8.5-11.5-14.4-6.9L115.4 505.1a8.74 8.74 0 0 0 0 13.8z"/>;


export type TopBarProps = {
    /** Set NavBar to position fixed at top of screen. Default: `false` */
    fixed?: boolean;
    /** Set this function for left menu expand button */
    onMenuExpand?: (expand: boolean) => any;
    menuIsExpanded?: boolean;

    // marginRight: string; // TODO (check admin lte)

    /** Will add an element that will match the height of TopBar (useful for when the element is fixed to top) */
    addSpacer?: boolean;

    // search: // TODO this will be more involved

    leftNavItems?: NavItem[];
    rightNavItems?: NavItem[];
    centerContent?: jsx_;

    zIndex?: number;

    // className?: string;
} & ComponentBase;



export function TopBar({
    fixed, onMenuExpand, leftNavItems, centerContent,
    rightNavItems, zIndex = 1000, className, style,
    addSpacer = false, menuIsExpanded
}: TopBarProps) {
    const [height, setHeight] = useState(0);
    const elRef = useRef<HTMLElement>(null);
    const observer = useRef(new ResizeObserver(entries =>
        setHeight(entries[0].borderBoxSize[0].blockSize)));

    useEffect(() => {
        if (elRef.current)
          observer.current.observe(elRef.current);
    
        return () => observer.current.disconnect();
    }, [elRef, observer]);
    
    const [isExpanded, setExpanded] = useState(false);
    const navBtns = (arr?: NavItem[]) => arr && arr.map(({ children, onClick }, i) => <TopBarBtn {...{children, onClick}} key={i} />);

    const exp = isType(menuIsExpanded, 'boolean') ? !menuIsExpanded : !isExpanded;
    return <>{(addSpacer && fixed) && <div style={{height: height}} className='w-full' />}<nav
        ref={elRef}
        className={classNames(
            "bg-white shadow dark:bg-gray-800 flex justify-between p-2 border",
            fixed && 'fixed top-0 left-0 right-0',
            className
        )}
        style={{zIndex, ...style}}
    >
        <ul className='flex flex-row'>
            {onMenuExpand &&
                <TopBarBtn onClick={() => {
                    setExpanded(!exp);
                    onMenuExpand(!exp);
                }}>
                    <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 1024 1024"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                        className='svg-fix'
                    >{exp ? menuIn : menuOut}</svg>
                </TopBarBtn>
            }
            
            {navBtns(leftNavItems)}
        </ul>

        {centerContent}

        <ul className='flex flex-row'>
            {navBtns(rightNavItems)}
        </ul>
    </nav></>;

}

const TopBarBtn = (p: PropsWithChildren<{ onClick?: () => any; }>) => <li
    className='p-4 text-neutral-500 hover:text-neutral-800 min-w-2'
>
    <span className='cursor-pointer' onClick={p.onClick}>{p.children}</span>
</li>;
