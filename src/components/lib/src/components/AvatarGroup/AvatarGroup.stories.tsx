import React from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { AvatarGroup, AvatarGroupProps } from "./AvatarGroup";
import { arrGen, rand } from "@giveback007/util-lib";
import { avatarUtils } from "../../stories.utils";

const args: AvatarGroupProps = {
    avatars: arrGen(rand(5, 12)).map(() => ({
        dataState: 'done',
        status: avatarUtils.getStatus(),
        imgSrc: avatarUtils.getImg()
    })),
    size: 'md',
    maxShow: 3
};

const meta: ComponentMeta<typeof AvatarGroup> = {
    title: 'Component/AvatarGroup',
    component: AvatarGroup,
    args
};

export default meta;

const Template: ComponentStory<typeof AvatarGroup> = (args) => <AvatarGroup {...args} />;

export const Example = Template.bind({});
// Example.args