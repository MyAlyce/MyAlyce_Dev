import { action } from '@storybook/addon-actions';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { avatarUtils } from '../../stories.utils';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { Dropdown, DropdownProps } from './Dropdown';
import { AiOutlineMail } from 'react-icons/ai';
import { FaUserFriends } from 'react-icons/fa';
import { GrDocumentText } from 'react-icons/gr';
import type { IconType } from 'react-icons/lib';

const args: DropdownProps = {
    items: [
        { type: 'action', title: 'action-1', onClick: action('action-1') },
        { type: 'action', title: 'action-2', onClick: action('action-2') },
        { type: 'break' },
        { type: 'action', title: 'separated-action', onClick: action('separated-action') },
        { type: 'break' },
        { type: 'section', title: 'Section'},
        { type: 'action', title: 'action-3', onClick: action('action-3') },
        { type: 'action', title: 'action-4', onClick: action('action-4') },
    ],
    children: <Button type='primary'>Toggle</Button>,
    containerClassName: 'm-auto'
};

const meta: ComponentMeta<typeof Dropdown> = {
    title: 'Component/Dropdown',
    component: Dropdown,
    args,
    argTypes: {
        header: { defaultValue: '', type: 'string' }
    },
    decorators: [Story => <div className='flex'>{Story()}</div>]
};

export default meta;

const Template: ComponentStory<typeof Dropdown> = (args) => <Dropdown {...args} />;

export const Example = Template.bind({});

export const JsxHeader = Template.bind({});
JsxHeader.args = { ...args, header: <div className="bg-white w-full flex flex-row p-2 text-gray-700">
    <Avatar size='sm' dataState='done' imgSrc={avatarUtils.getImg()} />
    <div className='flex flex-col'>
        <div>John Doe</div>
        <div>doe@john.com</div>
    </div>
</div> };

const aElm = (Icon: IconType, text: string, time: string) => <a className="flex flex-row text-sm hover:bg-gray-100 text-gray-600 cursor-pointer px-4 py-2">
    <Icon className='svg-fix mr-2 h-auto' /> {text}
    <span className="ml-auto text-sm">{time}</span>
</a>;

export const JsxItems = Template.bind({});
JsxItems.args = {
    ...args,
    size: 'md',
    itemBorders: true,
    header: <span className="py-1.5 block text-center text-gray-500">15 Notifications</span>,
    items: [
        {
            type: 'jsx' ,
            element: aElm(AiOutlineMail, ' 4 new messages', ' 3 mins'),
        }, {
            type: 'jsx',
            element: aElm(FaUserFriends, ' 8 friend requests', ' 12 hours'),
        }, {
            type: 'jsx',
            element: aElm(GrDocumentText, ' 3 new reports', ' 2 days'),
        },
    ]
};