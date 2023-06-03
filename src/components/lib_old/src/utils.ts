import { RefObject, useEffect, useState } from "react";

export function clickOutListener(ref: RefObject<any>, onClickOut: () => any) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target)) {
                onClickOut();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    },
        [ref]
    );
}

export const useRefDimensions = (ref: RefObject<HTMLElement>) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (ref.current) {
          const boundingRect = ref.current.getBoundingClientRect();
          const { width, height } = boundingRect;
          
        //   if (width !== dimensions.width || height !== dimensions.height)
            setDimensions({ width, height });
        }
    }, [ref.current?.offsetHeight, ref.current?.offsetWidth]);

    return dimensions;
};

export const regexpUtil = {
    name: /^[a-z ,.'-]+$/i,
    // eslint-disable-next-line
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
} as const;

export const TextInputBorderMap = {
    default: 'border-secondary-300 placeholder-secondary-300 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-200',
    success: 'border-success-400 placeholder-success-300 focus:border-success-500 focus:outline-none focus:ring-1 focus:ring-success-200',
    warning: 'border-warning-400 placeholder-warning-300 focus:border-warning-500 focus:outline-none focus:ring-1 focus:ring-warning-200',
    danger: 'border-danger-400 placeholder-danger-300 focus:border-danger-500 focus:outline-none focus:ring-1 focus:ring-danger-200',
};

export const loremIpsum = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`;

export const customScrollBar = 'scrollbar-thin scrollbar-track-secondary-200 scrollbar-thumb-secondary-400 scrollbar';