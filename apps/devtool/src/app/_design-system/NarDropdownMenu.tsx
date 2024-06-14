import { faChevronDown, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ALIGN_OPTIONS, SIDE_OPTIONS } from '@radix-ui/react-popper'
import { FC, Fragment, MouseEvent, ReactNode, useCallback } from 'react'
import { classNames } from '../_lib/utils'
import NarButton from './NarButton'
import NarInput from './NarInput'
import NarMenuItem, { MenuItem } from './NarMenuItem'

export interface DropdownItem<T = any> {
  label?: string
  isCheckboxGroup?: boolean
  isRadioGroup?: boolean
  isRegularGroup?: boolean
  items: MenuItem<T>[]
}

export interface NarDropdownMenuProps<T = any> {
  label?: string
  data?: DropdownItem<T>[]
  selectedValue?: string
  triggerButton?: ReactNode
  isOpen?: boolean
  isSearchable?: boolean
  disabled?: boolean
  align?: (typeof ALIGN_OPTIONS)[number]
  side?: (typeof SIDE_OPTIONS)[number]
  sideOffset?: number
  onOpenChange?: (value: boolean) => void
  onSearch?: (text: string) => void
  onSelect: (item: MenuItem<T>) => void
}

const animationStyles =
  'will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade'

const NarDropdownMenu: FC<NarDropdownMenuProps> = ({
  label,
  data,
  selectedValue,
  triggerButton = <NarButton variant="tertiary" label="Select" rightIcon={<FontAwesomeIcon icon={faChevronDown} />} />,
  isOpen = false,
  isSearchable = false,
  disabled = false,
  align = 'center',
  side = 'bottom',
  sideOffset = 0,
  onSelect,
  onSearch,
  onOpenChange
}) => {
  const handleSelect = useCallback(
    (e: Event | MouseEvent, item: MenuItem<any>) => {
      e.preventDefault()
      onSelect({ ...item, checked: !item.checked })
      e.stopPropagation()
    },
    [onSelect]
  )

  return (
    <div className="flex flex-col gap-[8px]">
      {label && <div className="text-nv-xs text-nv-white">{label}</div>}
      <DropdownMenu.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
        <DropdownMenu.Trigger onClick={(e) => e.stopPropagation()} disabled={disabled} asChild>
          {triggerButton}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={classNames(
              'bg-nv-neutrals-700 border border-nv-neutrals-500 rounded-[8px] z-20',
              animationStyles
            )}
            align={align}
            side={side}
            sideOffset={sideOffset}
          >
            {isSearchable && onSearch && (
              <div className="border-b border-b-nv-neutrals-500 bg-nv-neutrals-900 rounded-t-[8px] p-[8px]">
                <NarInput placeholder="Search" leftIcon={faSearch} onChange={onSearch} />
              </div>
            )}
            {!data && (
              <div className="flex flex-col items-center justify-center min-h-[150px] min-w-[100px]">
                <FontAwesomeIcon className="text-nv-white" size="lg" icon={faSpinner} spin />
              </div>
            )}
            <div
              className={classNames(
                'max-h-[250px] overflow-y-auto',
                !isSearchable ? 'rounded-[8px]' : 'rounded-b-[8px]'
              )}
            >
              {data && !data.flatMap(({ items }) => items).length && (
                <div className="px-[12px] py-[8px] text-nv-white">No results found.</div>
              )}
              {data &&
                data.map(({ label: sectionTitle, items, isRegularGroup, isRadioGroup, isCheckboxGroup }, index) => (
                  <Fragment key={index}>
                    {sectionTitle && (
                      <DropdownMenu.Label className="text-nv-2xs text-nv-neutrals-200 px-[12px] py-[8px]">
                        {sectionTitle}
                      </DropdownMenu.Label>
                    )}
                    {isRegularGroup && (
                      <DropdownMenu.Group onClick={(e) => e.stopPropagation()}>
                        {items.map((item, i) => (
                          <DropdownMenu.Item
                            className="focus:bg-nv-neutrals-400 hover:outline-none focus:outline-none focus-visible:outline-none"
                            key={i}
                            textValue=""
                            onClick={(e) => handleSelect(e, item)}
                          >
                            <NarMenuItem {...item} />
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Group>
                    )}
                    {isRadioGroup && (
                      <DropdownMenu.RadioGroup value={selectedValue} onClick={(e) => e.stopPropagation()}>
                        {items.map((item, i) => (
                          <DropdownMenu.RadioItem
                            className="focus:bg-nv-neutrals-400 hover:outline-none focus:outline-none focus-visible:outline-none"
                            key={i}
                            textValue=""
                            value={item.value}
                            onSelect={(e) => handleSelect(e, item)}
                          >
                            <NarMenuItem {...item} />
                          </DropdownMenu.RadioItem>
                        ))}
                      </DropdownMenu.RadioGroup>
                    )}
                    {isCheckboxGroup && (
                      <DropdownMenu.Group onClick={(e) => e.stopPropagation()}>
                        {items.map((item, i) => (
                          <DropdownMenu.CheckboxItem
                            className="flex items-center gap-[8px] focus:bg-nv-neutrals-400 hover:outline-none focus:outline-none focus-visible:outline-none"
                            key={i}
                            textValue=""
                            checked={item.checked}
                            onSelect={(e) => handleSelect(e, item)}
                          >
                            <NarMenuItem {...item} displayCheckbox />
                          </DropdownMenu.CheckboxItem>
                        ))}
                      </DropdownMenu.Group>
                    )}
                  </Fragment>
                ))}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}

export default NarDropdownMenu
