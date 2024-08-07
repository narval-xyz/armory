import { faChevronDown, faChevronUp, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Collapsible from '@radix-ui/react-collapsible'
import { FC, ReactNode, useState } from 'react'
import { classNames } from '../_lib/utils'
import NarIconButton from './NarIconButton'

interface NarCollapsibleProps {
  icon?: IconDefinition
  title: string
  children: ReactNode
}

const NarCollapsible: FC<NarCollapsibleProps> = ({ icon, title, children }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible.Root className="w-full" open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={classNames(
          'flex items-center gap-2 px-[24px] py-[20px] bg-nv-neutrals-600',
          isOpen ? 'rounded-t-[8px]' : 'rounded-[8px]'
        )}
      >
        {icon && <FontAwesomeIcon icon={icon} />}
        <div className="flex items-center gap-[8px] flex-1">{title}</div>
        <Collapsible.Trigger asChild>
          <NarIconButton icon={isOpen ? faChevronUp : faChevronDown} />
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
