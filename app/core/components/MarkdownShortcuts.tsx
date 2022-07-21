import { Fragment } from "react"
import { Transition } from "@headlessui/react"

const MarkdownShortcuts = ({ isOpen }) => {
  return (
    <Transition
      as={Fragment}
      show={isOpen}
      enter="transform transition ease-in-out duration-500 sm:duration-700"
      enterFrom="translate-y-full"
      enterTo="translate-y-0"
      leave="transform transition ease-in-out duration-500 sm:duration-700"
      leaveFrom="translate-y-0"
      leaveTo="translate-y-full"
    >
      <div className="bg-[#121212] border-t border-concrete p-6 pb-12 fixed bottom-0 left-[70px] w-[calc((100%-70px)*3/4)] grid grid-cols-3 gap-6">
        <h3 className="col-span-3 font-bold">Markdown Shortcuts</h3>
        <div className="space-y-6">
          <span className="flex flex-row justify-between text-sm">
            <span>Headings 1-6</span>
            <div className="flex flex-col text-concrete">
              <span># Heading</span>
              <span>## Heading</span>
              <span>### Heading</span>
            </div>
          </span>
          <span className="flex flex-row justify-between text-sm">
            <span>Image</span>
            <span className="text-concrete">![alt-text](image.jpg)</span>
          </span>
          <span className="flex flex-row justify-between text-sm">
            <span>Link</span>
            <span className="text-concrete">[title](https://www.example.com)</span>
          </span>
        </div>

        <div className="space-y-6">
          <span className="flex flex-row justify-between text-sm">
            <span>Bold</span>
            <span className="text-concrete">**bold text**</span>
          </span>
          <span className="flex flex-row justify-between text-sm">
            <span>Italic</span>
            <span className="text-concrete">*italicized text*</span>
          </span>
          <span className="flex flex-row justify-between text-sm">
            <span>Blockquote</span>
            <span className="text-concrete">&gt;blockquote</span>
          </span>
          <span className="flex flex-row justify-between text-sm">
            <span>Code</span>
            <span className="text-concrete">`code`</span>
          </span>
          <span className="flex flex-row justify-between text-sm">
            <span>Horizontal rule</span>
            <span className="text-concrete">---</span>
          </span>
        </div>
        <div className="space-y-6">
          <span className="flex flex-row justify-between text-sm">
            <span>Ordered list</span>
            <div className="flex flex-col text-concrete">
              <ol>
                <li>1. One</li>
                <li>2. Two</li>
                <li>3. Three</li>
              </ol>
            </div>
          </span>
          <span className="flex flex-row justify-between text-sm">
            <span>Unordered list</span>
            <div className="flex flex-col text-concrete">
              <ul>
                <li>- Foo</li>
                <li>- Bar</li>
                <li>- Bazz</li>
              </ul>
            </div>
          </span>
        </div>
      </div>
    </Transition>
  )
}

export default MarkdownShortcuts
