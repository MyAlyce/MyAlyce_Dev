import React, { Component, PropsWithChildren, useEffect, useState } from 'react';
// import classNames from 'classnames';
import type { jsx_ } from '../../general.types';
import { arrDivide } from '@giveback007/util-lib';

export type SquareGirProps = {
    items: jsx_[];
}

type S =  {
    sizeBy: 'vw' | 'vh';
}

/** This is a */
export class SquareGrid extends Component<SquareGirProps, S> {
    state: S = {
        sizeBy: 'vw'
    };

    resizeRef?: ReturnType<typeof onResize>;

    componentDidMount = () => {
        const setSizeBy = () => {
            const sizeBy = window.innerHeight > window.innerWidth ? 'vw' : 'vh';
            if (sizeBy === this.state.sizeBy) return;

            this.setState({ sizeBy });
        };

        setSizeBy();
        this.resizeRef = onResize(setSizeBy);
    };

    componentWillUnmount = () => this.resizeRef?.stop();

    render = () => {
        const p = this.props;
        const s = this.state;

        const size = '85' + s.sizeBy;
        return <div
            className='border flex flex-col'
            style={{ height: size, width: size }}
        >
            <GridFull items={p.items} />
        </div>;
    };
}

function GridFull(p: { items: jsx_[]; }) {
    const [size, setSize] = useState('0');
    const [rows, setRows] = useState<jsx_[][]>([]);

    useEffect(() => {
        const nOfItems = p.items.length;
        const nRows = Math.ceil(Math.sqrt(nOfItems));
        
        const rows = arrDivide(p.items, nOfItems / nRows);

        setRows(rows);
        setSize((100 / rows.length).toFixed(5) + '%');
    }, [p.items]);

    return <>{rows.map((rw, i) => <div className='flex flex-row' style={{ height: size }} key={i}>
        {rw.map((children, i) => <GridItem {...{children, size}} key={i} />)}
    </div>)}</>;
}

function GridItem({ children, size }: PropsWithChildren<{ size: string; }>) {

    return <div style={{ width: size }}
    className="h-full m-auto"
    >{children}</div>;
    // classNames('border h-1/3 w-1/3', x.selected && 'border-blue-400')
}

function onResize(fct: (ev: UIEvent) => any) {
    addEventListener('resize', fct);
    return { stop: () => removeEventListener('resize', fct) };
}