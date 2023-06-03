import type { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { Button } from './Button';

const meta: ComponentMeta<typeof Button> = {
  title: 'Component/Button',
  component: Button,
  args: {

  },
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
};

export default meta;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args}>Button</Button>;

export const Example = Template.bind({});
