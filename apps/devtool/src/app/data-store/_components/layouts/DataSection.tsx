'use client'

import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { capitalize } from 'lodash'
import { FC, ReactNode } from 'react'
import NarButton from '../../../_design-system/NarButton'

interface DataSectionProps {
  name: string
  data: any[] | undefined
  buttons?: ReactNode
  children: ReactNode
  onCreate?: () => void
}

const DataSection: FC<DataSectionProps> = ({ name, data, buttons, children, onCreate }) => {
  if (!data) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="text-nv-lg grow">{capitalize(name)}</div>
        {buttons}
        <NarButton variant="tertiary" label="Create" leftIcon={<FontAwesomeIcon icon={faPlus} />} onClick={onCreate} />
      </div>
      {!data.length && <div>No {name}</div>}
      {data.length > 0 && <div className="flex flex-col gap-2">{children}</div>}
    </div>
  )
}

export default DataSection
