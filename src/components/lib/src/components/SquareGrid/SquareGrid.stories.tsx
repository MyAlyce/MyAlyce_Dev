import React, { useState } from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { SquareGirProps, SquareGrid } from "./SquareGrid";
import { Button, TextInput } from "../..";
import { arrGen } from "@giveback007/util-lib";

const args: SquareGirProps = {
    items: arrGen(16).map((_, i) => <div className="border w-full h-full">{i + 1}</div>)
};

const meta: ComponentMeta<typeof SquareGrid> = {
    title: 'Component/SquareGrid',
    component: SquareGrid,
    args,
    decorators: [(Story, { args }) => {
        const [items, setItems] = useState<JSX.Element[]>(args.items);

        const handler = (num: string | '-' | '+') => {
            const len = items.length;
            const n = num === '-' ? (-1 + len) : num === '+' ? (1 + len) : Number(num);
            const arr = arrGen(n || 0).map((_, i) => <div className="border w-full h-full">{i + 1}</div>);
            setItems(arr);
        };

        return <>
            <div className="flex flex-row">
                <TextInput
                    value={items.length}
                    label="Squares"
                    labelType="addon"
                    type="number"
                    inputClassName="w-20"
                    onChange={(e: any) => handler(e.target.value)}
                />
                <Button onClick={() => handler('-')} type="danger" size="lg" shape="flat">-</Button>
                <Button onClick={() => handler('+')} type="success" size="lg" shape="flat">+</Button>
            </div>
            

            {Story({ args: { ...args, items } })}
        </>;
    }]
};

export default meta;

const Template: ComponentStory<typeof SquareGrid> = (args) => <SquareGrid {...args} />;

export const Example = Template.bind({});

