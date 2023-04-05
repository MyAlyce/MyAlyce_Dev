import { nonValue, debounceTimeOut } from '@giveback007/util-lib';
import classNames from 'classnames';
import React, { Component } from 'react';
import type { ColorTypes, ComponentBase, ObjMap } from '../../general.types';
import { AlertIcon } from './AlertIcon';

export type AlertProps = {
    type: ColorTypes;
    /** Number of milliseconds to automatically close the notification. The timeout will be restarted on cursor hover.  */
    timeoutMs?: number;
    onClose?: () => any;
    title: string;
    text?: string;
} & ComponentBase;

type S = {
    botW: number;
    isClosing: boolean;
    isClosed: boolean;
    isHover: boolean;
    transitionDuration?: string;
}

const AlertColorMap: ObjMap<ColorTypes> = { primary: 'text-primary-600', secondary: 'text-secondary-600', info: 'text-info-600', warning: 'text-warning-600', danger: 'text-danger-600', success: 'text-success-600' };
const AlertTextColor: ObjMap<ColorTypes> = { primary: 'text-primary-900', secondary: 'text-secondary-900', info: 'text-info-900', warning: 'text-warning-900', danger: 'text-danger-900', success: 'text-success-900' };
export class Alert extends Component<AlertProps> {
    
    state: S = {
        botW: 100,
        isClosing: false,
        isClosed: false,
        isHover: false,
        transitionDuration: undefined,
    };

    closingDebounce = debounceTimeOut();

    handleMouseHover = (isHover: boolean) => {
        const { timeoutMs } = this.props;
        const isTO = !nonValue(timeoutMs);

        if (isTO && !isHover) {
            this.closingDebounce(this.startClosing, timeoutMs);
        } else if (isHover) {
            this.closingDebounce('cancel');
        }

        this.setState(isHover ?
            { isClosing: false, botW: 100, isHover }
            :
            { isHover, botW: isTO ? 0 : 100 }
        );
    };

    startClosing = () => {
        this.setState({ isClosing: true });
        this.closingDebounce(this.close, 700);
    };

    close = () => {
        this.props.onClose && this.props.onClose();
        this.setState({ isClosed: true });
    };

    componentDidMount() {
        const { timeoutMs } = this.props;
        if (!nonValue(timeoutMs)) {
            this.setState({ transitionDuration: `${timeoutMs}ms` });
            setTimeout(() => this.setState({ botW: 0 }), 0);
            this.closingDebounce(this.startClosing, timeoutMs);
        }
    }

    componentWillUnmount = () => this.closingDebounce('cancel');

    render = () => {
        const { title, text, type, className, style } = this.props;
        const { isHover, isClosing, botW, transitionDuration: botTime, isClosed } = this.state;
        const transitionDuration = isHover ? undefined : botTime;
        
        const containerClassName = classNames(
            'bg-white border border-current border-b-0 rounded-lg flex flex-col overflow-hidden transition-opacity duration-700',
            {'opacity-0': isClosing },
            AlertColorMap[type],
            className
        );

        return isClosed ? null : <div
            className={containerClassName}
            style={style}
            onMouseEnter={() => this.handleMouseHover(true)}
            onMouseLeave={() => this.handleMouseHover(false)}
        >
            <div className="p-1 flex w-full overflow-hidden mx-auto">
                <div className='pt-2 ml-3'>
                    <AlertIcon type={type} />
                </div>

                <div className="w-full flex justify-between items-start px-0 py-2">
                    <div className="ml-3">
                        <p className="font-bold">{title}</p>

                        {text && <p className={`mt-1 text-sm ${AlertTextColor[type]}`}>
                            {text}
                        </p>}
                    </div>
                    <a className='mr-1 cursor-pointer' onClick={this.close}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </a>
                </div>

            </div>
            <span className='border-b-4 border-current transition-all ease-linear' style={{ width: `${botW}%`, transitionDuration }}></span>
        </div>;
    };
}
