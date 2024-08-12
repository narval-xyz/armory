import { faCheckDouble, faSearch, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import NarCheckbox from '../../_design-system/NarCheckbox'
import NarInput from '../../_design-system/NarInput'

interface MultiSelectListItem {
  label: string
  sublabel?: string
  value: string
  checked: boolean
}

const unselect = (item: MultiSelectListItem) => ({ ...item, checked: false })

const MultiSelectList: FC<{
  items: MultiSelectListItem[] | undefined
  onSelect: (items: string[]) => void
}> = ({ items, onSelect }) => {
  if (!items) return null

  const [searchQuery, setSearchQuery] = useState('')
  const [list, setList] = useState(items)
  const unselectAll = () => setList(items.map(unselect))

  const selected = useMemo(() => list.filter((item) => item.checked), [list])
  const isAllSelected = useMemo(() => selected.length === items.length, [selected])

  const selectAll = useCallback(() => {
    const newList = items.map((item) => ({ ...item, checked: true }))
    setList(newList)
  }, [items, setList])

  const toggleCheckItem = useCallback(
    (value: string) => {
      const newList = list.map((item) => {
        if (item.value === value) {
          return {
            ...item,
            checked: !item.checked
          }
        }
        return item
      })

      setList(newList)
    },
    [list, setList]
  )

  useEffect(() => onSelect(selected.map((item) => item.value)), [selected, onSelect])

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex items-center gap-[24px]">
        <NarInput
          placeholder="Find members by name"
          leftIcon={faSearch}
          value={searchQuery}
          onChange={setSearchQuery}
        />
        {!searchQuery && (
          <NarButton
            label={isAllSelected ? 'Unselect All' : 'Select All'}
            variant="tertiary"
            rightIcon={<FontAwesomeIcon icon={isAllSelected ? faXmarkCircle : faCheckDouble} />}
            onClick={() => (isAllSelected ? unselectAll() : selectAll())}
          />
        )}
      </div>
      <div className="flex flex-col gap-[32px]">
        <div className="flex flex-col gap-[16px] h-[250px] pr-[4px]">
          <div className="flex items-center justify-between pr-[26px]">
            <div className="text-nv-md text-nv-white">All ({list.length})</div>
            {selected.length > 0 && (
              <div className="flex items-center gap-[8px] text-nv-2xs">
                <div className="text-nv-blue-500">{selected.length} Selected</div>
                <div className="underline cursor-pointer" onClick={() => unselectAll()}>
                  Clear
                </div>
              </div>
            )}
          </div>
          <ul className="pr-[16px] overflow-y-auto">
            {list
              .filter(
                (item) =>
                  item.label.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
                  item.sublabel?.toLowerCase().startsWith(searchQuery.toLowerCase())
              )
              .map((item) => (
                <li key={item.value} className="flex items-center justify-between h-[56px]">
                  <div className="flex items-center gap-[8px]">
                    <Image
                      className="rounded-full"
                      width={40}
                      height={40}
                      src={`https://effigy.im/a/${item.label}.png`}
                      quality="100"
                      unoptimized
                      alt="wallet-avatar"
                    />
                    <div className="flex flex-col gap-[4px]">
                      <div className="text-nv-xs text-nv-white font-bold">{item.label}</div>
                      {item.sublabel && <div className="text-nv-2xs text-nv-neutrals-50">{item.sublabel}</div>}
                    </div>
                  </div>
                  <NarCheckbox
                    id={item.value}
                    checked={item.checked}
                    onCheckedChange={() => toggleCheckItem(item.value)}
                  />
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MultiSelectList
