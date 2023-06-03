import React, { useState } from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
// import { useState } from "@storybook/react";
import { Alert, AlertProps } from "./Alert";
import { sec } from "@giveback007/util-lib";
import { Button } from "../Button/Button";

const args: AlertProps = {
    title: 'Post has been published!',
    text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Inventore, sed?',
    type: 'success'
};

const meta: ComponentMeta<typeof Alert> = {
    title: 'Component/Alert',
    component: Alert,
    args
};

export default meta;

const Template: ComponentStory<typeof Alert> = (args) => <Alert {...args} />;

export const Example = Template.bind({});

export const Timeout = Template.bind({});
Timeout.decorators = [(Story, { args }) => {
    const [isClosed, setIsClosed] = useState(false);
    const onClose = () => { setIsClosed(true); args.onClose?.(); };

    return isClosed ? <Button type='primary' onClick={() => setIsClosed(false)}>Restart</Button> : Story({ args: { ...args, onClose } });
}];
Timeout.args = {
    ...args,
    timeoutMs: sec(1.5),
};
