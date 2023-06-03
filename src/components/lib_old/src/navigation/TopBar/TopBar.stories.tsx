import React, { useEffect, useState } from "react";
import { action } from '@storybook/addon-actions';
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { GrChatOption, GrNotification } from 'react-icons/gr';
import { TopBar, TopBarProps } from "./TopBar";
import { Dropdown } from "../../components/Dropdown/Dropdown";
import { loremIpsum } from "../../utils";
import { interval } from "@giveback007/util-lib";

const args: TopBarProps = {
  leftNavItems: [
    { children: 'Home', onClick: action('Home') },
    { children: 'Contact', onClick: action('Contact') }
  ],
  rightNavItems: [
    {
      children: <Dropdown
        items={[
          { type: 'action', title: 'action-1', onClick: action('action-1') },
          { type: 'action', title: 'action-2', onClick: action('action-2') },
          { type: 'break' },
          { type: 'action', title: 'separated-action', onClick: action('separated-action') },
        ]}
        // show
        align="right"
        containerClassName='w-full h-full'
        className="mt-4"
      >
        <GrChatOption className="svg-fix" />
      </Dropdown>,
      onClick: action('Chat')
    }, {
      children: <Dropdown
        items={[
          { type: 'action', title: 'action-1', onClick: action('action-1') },
          { type: 'action', title: 'action-2', onClick: action('action-2') },
          { type: 'break' },
          { type: 'action', title: 'separated-action', onClick: action('separated-action') },
        ]}
        // show
        align="right"
        containerClassName='w-full h-full'
        className="mt-4"
      >
        <GrNotification className="svg-fix" />
      </Dropdown>,
      onClick: action('Notification')
    }
  ],
  addSpacer: true,
};

const meta: ComponentMeta<typeof TopBar> = {
    title: 'Navigation/TopBar',
    component: TopBar,
    parameters: { docs: { iframeHeight: 100, inlineStories: false, } },
    args,
    decorators: [Story => <>
      {Story()}<p>{loremIpsum}</p>
    </>]
};

export default meta;

const Template: ComponentStory<typeof TopBar> = (args) => <TopBar {...args} />;

export const Example = Template.bind({});

export const CenterContent = Template.bind({});
CenterContent.decorators = [(Story, { args }) => {
  const [date, setDate] = useState(new Date);

  useEffect(() => {
    const itv = interval(() => setDate(new Date), 1000);

    return itv.stop;
  }, []);

  return Story({ args: { ...args, centerContent: <h4 className="m-auto text-sm font-semibold text-secondary-700">{date.toLocaleTimeString('en-US')}</h4> }});
}];
