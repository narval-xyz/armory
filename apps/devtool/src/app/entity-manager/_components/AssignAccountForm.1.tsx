import { FC, useEffect, useState } from "react";
import NarDropdownMenu from '../../_design-system/NarDropdownMenu';
import NarButton from '../../_design-system/NarButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import NarCheckbox from "../../_design-system/NarCheckbox";
import { AssignAccountFormProps, getAccountsDropdownItems } from "./AssignAccountForm";

const AssignAccountForm: FC<AssignAccountFormProps> = ({ user, accounts, setUserAccount }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userId, setUserId] = useState(user.id);
  const [accountId, setAccountId] = useState<string | undefined>();

  useEffect(() => {
    if (accountId) {
      setUserAccount({
        userId,
        accountId
      });
    }
  }, [accountId]);

  return (
    <div className="flex flex-col gap-6">
      {accounts.map((account) => (
        <NarCheckbox
          label={account.address}
        >
))}

          <NarDropdownMenu
            label="Account"
            data={getAccountsDropdownItems(accounts)}
            triggerButton={<NarButton
              variant="tertiary"
              label={accountId || 'Choose an account'}
              rightIcon={<FontAwesomeIcon icon={faChevronDown} />} />}
            isOpen={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
            onSelect={(item) => {
              setAccountId(item.value);
              setIsDropdownOpen(false);
            }} />
        </div>
      ))}

      export default AssignAccountForm
    </>);
};

