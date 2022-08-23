import React from "react"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import Button from "../app/core/components/sds/buttons/Button"
import { ButtonType } from "../app/core/components/sds/buttons/Button"

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "buttons/Button",
  component: Button,
} as ComponentMeta<typeof Button>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args}>{args.children}</Button>
export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  type: ButtonType.Primary,
  children: "Button",
}

export const Secondary = Template.bind({})
Secondary.args = {
  type: ButtonType.Secondary,
  children: "Short",
}

export const Unemphasized = Template.bind({})
Unemphasized.args = {
  type: ButtonType.Unemphasized,
  children: "Blank",
}
