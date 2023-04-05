import React from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { TextInput, TextInputProps } from "./TextInput";
import { action } from "@storybook/addon-actions";

const args: TextInputProps = {
    placeholder: 'placeholder'
};

const meta: ComponentMeta<typeof TextInput> = {
    title: 'Forms/TextInput',
    component: TextInput,
    args,
    argTypes: {
        button: { defaultValue: undefined }
    }
};

export default meta;

const Template: ComponentStory<typeof TextInput> = (args) => <TextInput {...args} />;

export const Example = Template.bind({});

export const WithButton = Template.bind({});
WithButton.args = {
    ...args,
    button: { label: 'Submit', type: 'primary', outline: false, onClick: action('Submit') }
};
