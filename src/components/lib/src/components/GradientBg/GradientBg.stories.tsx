import type { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';
import { loremIpsum } from '../../utils';
import { GradientBg, GradientBgProps } from './GradientBg';

const args: GradientBgProps = {
    gradient: 8,
    bgGradientFrom: 'blue',
    bgGradientTo: 'teal',
    className: "h-full w-full p-3",
    children: <p>{loremIpsum}</p>
};

const meta: ComponentMeta<typeof GradientBg> = {
  title: 'Component/GradientBg',
  component: GradientBg,
  args,
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
};

export default meta;

const Template: ComponentStory<typeof GradientBg> = (args) => <GradientBg {...args} />;

export const Example = Template.bind({});
