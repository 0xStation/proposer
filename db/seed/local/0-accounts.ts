import db from "../../index"
import createAccount from "app/account/mutations/createAccount"

interface Skill {
  value: string
  label: string
}

interface CreateAccountParams {
  name: string
  discordId: string
  timezone: string
  skills: Skill[]
  address: string
  pfpURL: string
  pronouns?: string
}

const michael: CreateAccountParams = {
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  name: "frog",
  pronouns: "he/him",
  skills: [],
  discordId: "frog#3881",
  timezone: "EST",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036018-25f65c4d-a968-4c6c-b328-15958acdb649.png",
}

const mima: CreateAccountParams = {
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111ABC",
  name: "mima",
  pronouns: "she/her",
  skills: [],
  discordId: "mima#3881",
  timezone: "EST",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036018-25f65c4d-a968-4c6c-b328-15958acdb649.png",
}

const seed = async () => {
  console.log("Seeding Accounts")
  const users = [michael, mima]
  for (const name in users) {
    const contributorData = users[name] as CreateAccountParams
    const account = await db.account.findUnique({
      where: { address: contributorData.address },
    })

    if (account) {
      continue
    }

    await createAccount(contributorData)
  }
}

export default seed
