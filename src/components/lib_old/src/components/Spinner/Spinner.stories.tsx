import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { Spinner } from './Spinner';

const meta: ComponentMeta<typeof Spinner> = {
    title: 'Component/Spinner',
    component: Spinner,
    args: {
        size: 'sm'
    }
};

export default meta;

const Template: ComponentStory<typeof Spinner> = (args) => <Spinner {...args} />;

export const Example = Template.bind({});

export const AutoSize = Template.bind({});
AutoSize.decorators = [Story => (
    <>
        <h3>(Resize The Box:)</h3>
        <div style={{
            margin: 'auto',
            border: 'solid 2px',
            width: 150,
            height: 100,
            resize: 'both',
            overflow: 'auto'
        }}>{Story()}</div>
    </>
)];
AutoSize.args = {
    size: 'auto',
};

