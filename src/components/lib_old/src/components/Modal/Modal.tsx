import { isType } from "@giveback007/util-lib";
import classNames from "classnames";
import React, { MouseEventHandler, PropsWithChildren } from "react";
import type { ComponentBase, jsx_ } from "../../general.types";
import { Backdrop } from "../Backdrop/Backdrop";

type ModalProps = PropsWithChildren<{
    zIndex?: number;
    header?: string | jsx_;
    // content?: jsx_;
    /** Setting this function creates a top right 'x', clicking it will execute this function. */
    onClose?: MouseEventHandler;

    /** A function to execute on backdrop click. */
    onBackdropClick?: MouseEventHandler;
}> & ComponentBase;

export function Modal({
    zIndex = 1004, className, style, header,
    onClose, onBackdropClick, children
}: ModalProps) {
    return <>
        <Backdrop {...{ zIndex: zIndex -1, onBackdropClick, transition: false }} />
        <div
            className={classNames(
                "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                "border border-secondary-300 shadow-lg bg-white w-11/12 md:max-w-md mx-auto rounded overflow-y-auto",
                className
            )}
            style={{zIndex, ...style}}
        >
            <div className="relative">

                {/* CLOSE - X */}
                {onClose && <div
                    className="cursor-pointer absolute top-3.5 right-3.5"
                    onClick={onClose}
                >
                    <svg 
                        className="fill-current text-black"
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 18 18"
                    >
                        <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                    </svg>
                </div>}

                <div className="py-4 px-6">
                    {/* HEADER */}
                    {header && <div className="pb-3">
                        {isType(header, 'string') ? <p className="text-2xl font-bold">{header}</p> : header}
                    </div>}

                    {/* CHILDREN */}
                    {children}
                </div>
            </div>
        </div>
    </>;
}