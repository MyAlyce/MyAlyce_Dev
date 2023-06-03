import { isType, nonValue } from '@giveback007/util-lib';
import { MouseEventHandler, ReactNode, useEffect, useState, MouseEvent } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ComponentBase, ObjMap } from '../../general.types';
import type { ColorTypes, Size } from '../../general.types';
import { Chevron } from '../Chevron/Chevron';
import { customScrollBar } from '../../utils';

export type AccordionProps = {
    title?: string | ReactNode;
    /** Set this to true to automatically collapse details when another is opened; Default: `false` */
    collapseOthers?: boolean;
    items: {
        title: string;
        content: ReactNode;
        /** By default Accordion will manage open/close of details, but you can also do this programmatically. */
        isOpen?: boolean;
        onClick?: (e: MouseEvent) => any;
    }[];
    size?: Size | 'auto';
    contentMaxHeigh?: string | number;
    type?: ColorTypes;
} & ComponentBase;

const accordionSizeMap: ObjMap<Size | 'auto'> = { xs: 'max-w-xs', sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', auto: 'w-full' };
const chevronColorMap: ObjMap<ColorTypes> = { danger: 'text-danger-700', info: 'text-info-700', primary: 'text-primary-700', secondary: 'text-secondary-700', success: 'text-success-700', warning: 'text-warning-700', };
const accentColorMap: ObjMap<ColorTypes> = { danger: 'border-danger-600', info: 'border-info-600', primary: 'border-primary-600', secondary: 'border-secondary-600', success: 'border-success-600', warning: 'border-warning-600', };
export function Accordion ({
    title, collapseOthers = false, items,
    size = 'auto', type = 'secondary',
    className, style, contentMaxHeigh
}: AccordionProps) {
    const [openId, setOpenId] = useState(Date.now());
    const onOpen = (id: number) => setOpenId(id);

    return <main className={classNames(accordionSizeMap[size], className)} style={style}>
        <div className="w-full my-1">
            {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
            <ul className="flex flex-col">
                {items.map((itm, i) => <AccordionItem {...{...itm, collapseOthers, onOpen, openId, type, contentMaxHeigh}} key={i} />)}
            </ul>
        </div>
    </main>;
}

type AccordionItemProps = {
    title: string;
    onOpen: (id: number) => any;
    /** workaround, creates a new id every time a sibling is opened, allows to compare id and close   */
    openId: number;
    collapseOthers: boolean;
    content: ReactNode;
    type: ColorTypes;

    isOpen?: boolean;
    onClick?: (e: React.MouseEvent) => any;

    contentMaxHeigh?: string | number;
};
const AccordionItem = ({
    title, content, onOpen, openId,
    collapseOthers, type, onClick, ...p
}: AccordionItemProps) => {
    const [id, setId] = useState(openId);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (openId !== id) {
            setId(openId);
            setIsOpen(false);
        }
    }, [openId]);

    const handleClick: MouseEventHandler = (e) => {
        if (!isOpen) {
            const newId = Date.now();
            setId(newId);
            if (collapseOthers) onOpen(newId);
        }

        setIsOpen(!isOpen);
        onClick?.(e);
    };
    
    // if set in props use p.isOpen, else use isOpen via useState.
    const open = isType(p.isOpen, 'boolean') ? p.isOpen : isOpen;
    return <li className="bg-white my-2 shadow-lg">
        <h2 
            onClick={handleClick}
            className="
                flex flex-row justify-between items-center
                font-semibold p-3 cursor-pointer
            "
        >
            {isType(content, 'string') ? <span>{title}</span> : title}
            
            <Chevron
                direction={open ? 'up' : "down"}
                icon={8}
                size='sm'
                className={chevronColorMap[type]}
            />
        </h2>

        <div className={classNames(
            "border-l-2 overflow-hidden max-h-0 duration-700 transition-all",
            customScrollBar,
            accentColorMap[type],
            open && 'max-h-96',
        )}
            style={{ maxHeight: !nonValue(p.contentMaxHeigh) && open ? p.contentMaxHeigh : undefined }}
        >
            {isType(content, 'string') ? <p className="p-3 text-gray-900">
                {content}
            </p> : content}
        </div>
    </li>;
};
