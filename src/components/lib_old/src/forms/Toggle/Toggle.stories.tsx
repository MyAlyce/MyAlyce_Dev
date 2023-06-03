import React from 'react';
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { Toggle } from './Toggle';

const meta: ComponentMeta<typeof Toggle> = {
    title: 'Forms/Toggle',
    component: Toggle,
    args: {
        label: 'Toggle me'
    }
};

export default meta;

const Template: ComponentStory<typeof Toggle> = (args) => <Toggle {...args} />;

export const Example = Template.bind({});