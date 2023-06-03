import React from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import type { TextAreaProps } from "./TextArea";
import { TextArea } from "./TextArea";

const args: TextAreaProps = {
    placeholder: 'placeholder'
};

const meta: ComponentMeta<typeof TextArea> = {
    title: 'Forms/TextArea',
    component: TextArea,
    args,
    argTypes: {
        // button: { defaultValue: undefined }
    }
};

export default meta;

const Template: ComponentStory<typeof TextArea> = (args) => <TextArea {...args} />;

export const Example = Template.bind({});

