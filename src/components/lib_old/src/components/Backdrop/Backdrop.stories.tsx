import React, { useState } from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Backdrop } from './Backdrop';
import { Button } from '../Button/Button';
import { loremIpsum } from '../../utils';

const meta: ComponentMeta<typeof Backdrop> = {
  title: 'Component/Backdrop',
  component: Backdrop,
  args: {

  },
  decorators: [(Story, { args }) => {
    const [isOpen, setIsOpen] = useState(false);

    return <>
      <Button type='primary' onClick={() => setIsOpen(true)}>Open Backdrop</Button>
      <p>{loremIpsum}</p>
      {isOpen && Story({ args: { ...args, onBackdropClick: () => setIsOpen(false) } })}
    </>;
  }]
};

export default meta;

const Template: ComponentStory<typeof Backdrop> = (args) => <Backdrop {...args} />;

export const Example = Template.bind({});
