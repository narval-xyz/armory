import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons'
import * as Collapsible from '@radix-ui/react-collapsible'
import { FC, ReactNode, useState } from 'react'
import { classNames } from '../_lib/utils'
import NarIconButton from './NarIconButton'

interface NarCollapsibleProps {
  title: string
  children: ReactNode
}

const NarCollapsible: FC<NarCollapsibleProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={classNames(
          'flex items-center  px-[24px] py-[20px] bg-nv-neutrals-600',
          isOpen ? 'rounded-t-[8px]' : 'rounded-[8px]'
        )}
      >
        <div className="flex items-center gap-[8px] flex-1">{title}</div>
        <Collapsible.Trigger asChild>
          <NarIconButton icon={isOpen ? faChevronUp : faChevronDown} />
          {/* <button className="rounded-full h-[25px] w-[25px] inline-flex items-center justify-center outline-none">
            {isOpen ? (
              <FontAwesomeIcon icon={faChevronUp} size="sm" />
            ) : (
              <FontAwesomeIcon icon={faChevronDown} size="sm" />
            )}
          </button> */}
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content
        className={classNames(
          isOpen
            ? 'flex items-center px-[24px] py-[20px] rounded-b-[8px] border-t-2 border-nv-black bg-nv-neutrals-600 overflow-auto'
            : ''
        )}
      >
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export default NarCollapsible
