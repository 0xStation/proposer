import { useMutation } from "blitz"
import { Field, Form } from "react-final-form"
import Modal from "../../core/components/Modal"
import createApplication from "../mutations/createApplication"
import useStore from "../../core/hooks/useStore"
import { Account } from "../../account/types"

const AccountModal = ({
  isOpen,
  setIsOpen,
  initiativeId,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  initiativeId: number
}) => {
  const [createApplicationMutation] = useMutation(createApplication)
  const activeUser: Account | null = useStore((state) => state.activeUser)

  return (
    <Modal
      title="Complete your profile"
      subtitle="Complete your profile to continue submitting your interest."
      open={isOpen}
      toggle={setIsOpen}
    >
      <div className="mt-8">
        <Form
          onSubmit={async (values: { url: string }) => {
            try {
              await createApplicationMutation({
                ...values,
                initiativeId: initiativeId,
                applicantId: activeUser?.id || undefined,
              })
              alert("Applied successfully!")
            } catch (error) {
              alert("Error applying.")
            }
          }}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-marble-white">
                    Name
                  </label>
                  <Field
                    component="input"
                    name="name"
                    placeholder="Name"
                    className="mt-1 border border-concrete bg-tunnel-black text-marble-white p-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-marble-white">
                    Discord ID
                  </label>
                  <Field
                    component="input"
                    name="name"
                    placeholder="Name"
                    className="mt-1 border border-concrete bg-tunnel-black text-marble-white p-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="pronouns" className="text-marble-white">
                    Pronouns
                  </label>
                  <Field
                    component="input"
                    name="pronouns"
                    placeholder="Select one"
                    className="mt-1 border border-concrete bg-tunnel-black text-marble-white p-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="timezone" className="text-marble-white">
                    Timezone
                  </label>
                  <Field
                    component="select"
                    name="timezone"
                    placeholder="Select one"
                    className="mt-1 border border-concrete bg-tunnel-black text-marble-white p-2"
                  >
                    <option />
                    <option value="-12:00">(GMT -12:00) Eniwetok, Kwajalein</option>
                    <option value="-11:00">(GMT -11:00) Midway Island, Samoa</option>
                    <option value="-10:00">(GMT -10:00) Hawaii</option>
                    <option value="-09:50">(GMT -9:30) Taiohae</option>
                    <option value="-09:00">(GMT -9:00) Alaska</option>
                    <option value="-08:00">(GMT -8:00) Pacific Time (US &amp; Canada)</option>
                    <option value="-07:00">(GMT -7:00) Mountain Time (US &amp; Canada)</option>
                    <option value="-06:00">
                      (GMT -6:00) Central Time (US &amp; Canada), Mexico City
                    </option>
                    <option value="-05:00">
                      (GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima
                    </option>
                    <option value="-04:50">(GMT -4:30) Caracas</option>
                    <option value="-04:00">
                      (GMT -4:00) Atlantic Time (Canada), Caracas, La Paz
                    </option>
                    <option value="-03:50">(GMT -3:30) Newfoundland</option>
                    <option value="-03:00">(GMT -3:00) Brazil, Buenos Aires, Georgetown</option>
                    <option value="-02:00">(GMT -2:00) Mid-Atlantic</option>
                    <option value="-01:00">(GMT -1:00) Azores, Cape Verde Islands</option>
                    <option value="+00:00">
                      (GMT) Western Europe Time, London, Lisbon, Casablanca
                    </option>
                    <option value="+01:00">(GMT +1:00) Brussels, Copenhagen, Madrid, Paris</option>
                    <option value="+02:00">(GMT +2:00) Kaliningrad, South Africa</option>
                    <option value="+03:00">
                      (GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg
                    </option>
                    <option value="+03:50">(GMT +3:30) Tehran</option>
                    <option value="+04:00">(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi</option>
                    <option value="+04:50">(GMT +4:30) Kabul</option>
                    <option value="+05:00">
                      (GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent
                    </option>
                    <option value="+05:50">(GMT +5:30) Bombay, Calcutta, Madras, New Delhi</option>
                    <option value="+05:75">(GMT +5:45) Kathmandu, Pokhara</option>
                    <option value="+06:00">(GMT +6:00) Almaty, Dhaka, Colombo</option>
                    <option value="+06:50">(GMT +6:30) Yangon, Mandalay</option>
                    <option value="+07:00">(GMT +7:00) Bangkok, Hanoi, Jakarta</option>
                    <option value="+08:00">(GMT +8:00) Beijing, Perth, Singapore, Hong Kong</option>
                    <option value="+08:75">(GMT +8:45) Eucla</option>
                    <option value="+09:00">
                      (GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk
                    </option>
                    <option value="+09:50">(GMT +9:30) Adelaide, Darwin</option>
                    <option value="+10:00">
                      (GMT +10:00) Eastern Australia, Guam, Vladivostok
                    </option>
                    <option value="+10:50">(GMT +10:30) Lord Howe Island</option>
                    <option value="+11:00">
                      (GMT +11:00) Magadan, Solomon Islands, New Caledonia
                    </option>
                    <option value="+11:50">(GMT +11:30) Norfolk Island</option>
                    <option value="+12:00">
                      (GMT +12:00) Auckland, Wellington, Fiji, Kamchatka
                    </option>
                    <option value="+12:75">(GMT +12:45) Chatham Islands</option>
                    <option value="+13:00">(GMT +13:00) Apia, Nukualofa</option>
                    <option value="+14:00">(GMT +14:00) Line Islands, Tokelau</option>
                  </Field>
                </div>
              </div>

              <button
                type="submit"
                className="bg-magic-mint text-tunnel-black w-1/2 rounded mt-12 mx-auto block p-2"
              >
                Submit
              </button>
            </form>
          )}
        />
      </div>
    </Modal>
  )
}

export default AccountModal
