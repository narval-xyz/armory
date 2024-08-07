import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { english, generateMnemonic, generatePrivateKey } from 'viem/accounts'
import NarButton from '../../../_design-system/NarButton'
import NarInput from '../../../_design-system/NarInput'

export enum KeyType {
  PRIVATE_KEY,
  SEED_PHRASE
}

interface ImportKeyFormProps {
  keyType?: KeyType
  setImportKey: Dispatch<SetStateAction<{ key: string; keyType: KeyType } | undefined>>
}

export default function ImportKeyForm(props: ImportKeyFormProps) {
  const [keyType, setKeyType] = useState(props.keyType || KeyType.PRIVATE_KEY)
  const [key, setKey] = useState('')

  useEffect(() => {
    props.setImportKey({ key, keyType })
  }, [keyType, key])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-[8px] mb-[8px]">
        <NarButton
          className={keyType === KeyType.PRIVATE_KEY ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white' : ''}
          variant="tertiary"
          label="Private Key"
          onClick={() => {
            setKey('')
            setKeyType(KeyType.PRIVATE_KEY)
          }}
        />
        <NarButton
          className={keyType === KeyType.SEED_PHRASE ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white' : ''}
          variant="tertiary"
          label="Seed"
          onClick={() => {
            setKey('')
            setKeyType(KeyType.SEED_PHRASE)
          }}
        />
      </div>

      {keyType === KeyType.PRIVATE_KEY && (
        <div className="flex items-end gap-[8px]">
          <NarInput label="Private Key" value={key} onChange={setKey} type="password" />
          <NarButton label="Generate" onClick={() => setKey(generatePrivateKey())} />
        </div>
      )}

      {keyType === KeyType.SEED_PHRASE && (
        <div className="flex items-end gap-[8px]">
          <NarInput label="Seed Phrase" value={key} onChange={setKey} />
          <NarButton label="Generate" onClick={() => setKey(generateMnemonic(english))} />
        </div>
      )}
    </div>
  )
}
