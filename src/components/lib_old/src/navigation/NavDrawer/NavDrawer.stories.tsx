import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { NavDrawer, NavDrawerProps } from './NavDrawer';
import { avatarUtils } from '../../stories.utils';
import { MdDashboard } from 'react-icons/md';
import { IoLogoWechat } from 'react-icons/io5';
import { BsClipboardData } from 'react-icons/bs';
import { CgMenuRound } from 'react-icons/cg';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import logo from '../../assets/generic-logo-1.png';

const args: NavDrawerProps = {
  isOpen: true,
  user: { imgSrc: avatarUtils.getImg(), name: 'John Doe' },
  menuItems: [
    { type: 'action', icon: <MdDashboard />, title: 'dashboard', onClick: action('dashboard'), isActive: true },
    { type: 'action', icon: <BsClipboardData />, title: 'data', onClick: action('data') },
    { type: 'action', icon: <IoLogoWechat />, title: 'chat', onClick: action('chat') },
    { type: 'section', title: 'Section-1'},
    { type: 'action', icon: <MdDashboard />, title: 'dashboard', onClick: action('dashboard') },
    { type: 'action', icon: <BsClipboardData />, title: 'data', onClick: action('data') },
    { type: 'action', icon: <IoLogoWechat />, title: 'chat', onClick: action('chat') },
    { type: 'break' },
    
    { type: 'section', title: 'Section-2 Multi-Level'},
    { type: 'sub-menu', icon: <CgMenuRound />, title: 'Level-1', subMenu: [
        { type: 'action', icon: <AiOutlineInfoCircle />, title: 'Level-2', onClick: action('Level-2') },
        { type: 'action', icon: <AiOutlineInfoCircle />, title: 'Level-2', onClick: action('Level-2') },
        { type: 'sub-menu', icon: <CgMenuRound />, title: 'Level-2', subMenu: [
            { type: 'action', icon: <AiOutlineInfoCircle />, title: 'Level-3', onClick: action('Level-3') },
            { type: 'action', icon: <AiOutlineInfoCircle />, title: 'Level-3', onClick: action('Level-3') },
            { type: 'action', icon: <AiOutlineInfoCircle />, title: 'Level-3', onClick: action('Level-3') },
            { type: 'break'},
          ]
        },
        { type: 'action', icon: <AiOutlineInfoCircle />, title: 'Level-2', onClick: action('Level-2') },
      ]
    },
    { type: 'action', icon: <IoLogoWechat />, title: 'chat', onClick: action('chat') },
    { type: 'break' },

    { type: 'section', title: 'Section-3'},{ type: 'action', icon: <MdDashboard />, title: 'dashboard', onClick: action('dashboard') },
    { type: 'action', icon: <BsClipboardData />, title: 'data', onClick: action('data') },
    { type: 'action', icon: <IoLogoWechat />, title: 'chat', onClick: action('chat') },
    
  ],
  onAvatarClick: action('user-avatar'),
  onBrandClick: action('brand'),
  brand: 'Brand',
};


const meta: ComponentMeta<typeof NavDrawer> = {
  title: 'Navigation/NavDrawer',
  component: NavDrawer,
  parameters: { docs: { inlineStories: false, } },
  args,
  argTypes: {
    brand: { defaultValue: '', type: 'string' }
  },
};

export default meta;

const Template: ComponentStory<typeof NavDrawer> = (args) => <NavDrawer {...args} />;

export const Example = Template.bind({});

export const JsxBrand = Template.bind({});
JsxBrand.args = {
  ...args,
  brand: <img src={logo} />
};

