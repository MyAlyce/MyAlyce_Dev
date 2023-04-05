import React from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { Radio } from "./Radio";


const meta: ComponentMeta<typeof Radio> = {
    title: 'Forms/Radio',
    component: Radio,
    args: {
        label: 'Some Label'
    }
};

export default meta;

const Template: ComponentStory<typeof Radio> = (args) => <Radio {...args} />;

export const Example = Template.bind({});
