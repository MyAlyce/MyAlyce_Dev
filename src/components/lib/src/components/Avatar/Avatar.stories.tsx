import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Avatar, AvatarProps } from './Avatar';
import { avatarUtils } from '../../stories.utils';

const args: AvatarProps = {
    dataState: 'done',
    size: 'lg',
    name: 'Jon Doe',
    status: avatarUtils.getStatus(),
    imgSrc: avatarUtils.getImg(),
    badge: avatarUtils.getBadge()
} as const;

const meta: ComponentMeta<typeof Avatar> = {
    title: 'Component/Avatar',
    component: Avatar,
    parameters: {
        // docs: { inlineStories: false }
        // controls: { expanded: true },
    },
    args,
    argTypes: {
        // onClick: { defaultValue: undefined, type: 'function' }
    }
};

export default meta;

const Template: ComponentStory<typeof Avatar> = (args) => <Avatar {...args} />;

export const Example = Template.bind({});

export const Loading = Template.bind({});
Loading.args = {
    size: 'lg',
    dataState: 'loading'
};

export const Error = Template.bind({});
Error.args = {
    size: 'lg',
    dataState: 'error',
};

export const NoImage = Template.bind({});
NoImage.args = {
    ...args,
    imgSrc: undefined
};
