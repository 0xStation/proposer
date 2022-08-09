import React from "react"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import Heading from "../app/core/components/sds/text/Heading"

export default {
  title: "Text/Heading",
  component: Heading,
} as ComponentMeta<typeof Heading>

const Template: ComponentStory<typeof Heading> = (args) => <Heading {...args} />

export const Generic = Template.bind({})
Generic.args = {
  children: <p>Super Great Heading</p>,
}
