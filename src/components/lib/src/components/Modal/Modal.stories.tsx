import React, { useState } from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { Modal } from './Modal';
import { loremIpsum } from '../../utils';
import { Button } from '../Button/Button';
import { action } from '@storybook/addon-actions';

// const cancel = actions('Cancel').Cancel;
// cancel

const meta: ComponentMeta<typeof Modal> = {
  title: 'Component/Modal',
  component: Modal,
  args: {
    header: 'Header',
    children: <><div className="my-5">
        <p>{loremIpsum}</p>
    </div>

    <div className="flex justify-end pt-2">
      <Button type='secondary' size='lg' onClick={action('Cancel')}>Cancel</Button>
      <Button type='primary' size='lg' className='ml-3' onClick={action('Confirm')}>Confirm</Button>
    </div></>,
  },
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
  decorators: [(Story, { args }) => {
    const [isOpen, setIsOpen] = useState(true);
    const close = () => setIsOpen(false);

    return <>
      <Button type='primary' onClick={() => setIsOpen(true)}>Open Modal</Button>

      {isOpen && Story({ args: { ...args, onClose: close, onBackdropClick: close } })}
    </>;
  }]
};

export default meta;

const Template: ComponentStory<typeof Modal> = (args) => <Modal {...args} />;

export const Example = Template.bind({});
