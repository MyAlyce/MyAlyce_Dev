import React, { PropsWithChildren } from 'react';
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { Badge } from './Badge';

const meta: ComponentMeta<typeof Badge> = {
    title: 'Component/Badge',
    component: Badge,
    args: {
        size: 'lg',
        badge: 12,
    },
    decorators: [Story => (<Box>{Story()}</Box>)],
};

export default meta;

// eslint-disable-next-line @typescript-eslint/ban-types
const Box = ({ children }: PropsWithChildren<{}>) => <div 
    className='relative'
    style={{ margin: 'auto', border: 'solid 2px', width: 150, height: 100, resize: 'both', overflow: 'auto' }}
>{children}</div>;

const Template: ComponentStory<typeof Badge> = (args) => <Badge {...args} />;

export const Example = Template.bind({});

export const Boolean = Template.bind({});
Boolean.args = { size: 'lg', badge: true };
Boolean.argTypes = {
    badge: { defaultValue: true, type: 'boolean' }
};

export const Over999 = Template.bind({});
Over999.args = { size: 'lg', badge: 1000 };

