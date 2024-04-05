import { Dispatch, FC, SetStateAction } from 'react'
import { generatePrivateKey } from 'viem/accounts'
import NarButton from '../../../_design-system/NarButton'
import NarInput from '../../../_design-system/NarInput'

interface ImportWalletFormProps {
  privateKey: string
  setPrivateKey: Dispatch<SetStateAction<string>>
}

const ImportWalletForm: FC<ImportWalletFormProps> = ({ privateKey, setPrivateKey }) => (
  <div className="flex gap-6">
    <NarInput value={privateKey} onChange={setPrivateKey} />
    <NarButton label="Generate" onClick={() => setPrivateKey(generatePrivateKey())} />
  </div>
)

export default ImportWalletForm
