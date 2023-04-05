import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Chevron } from './Chevron';

const meta: ComponentMeta<typeof Chevron> = {
  title: 'Component/Chevron',
  component: Chevron,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  args: {
    icon: 7,
    direction: 'down',
    size: 'lg'
  },
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default meta;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Chevron> = (args) => <Chevron {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {};
