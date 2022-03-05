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

const kristen: CreateAccountParams = {
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  name: "rie",
  pronouns: "she/her",
  skills: [],
  discordId: "rie#9502",
  timezone: "PST",
  pfpURL: "https://pbs.twimg.com/profile_images/1480639057914855424/LiE4wCe2_400x400.jpg",
}

const chiyoko: CreateAccountParams = {
  address: "0x1E8f3C0286b4949e8eB1F5d705b49016dc84D288",
  name: "chiyoko",
  pronouns: "she/her",
  skills: [],
  discordId: "chiyoko#3881",
  timezone: "EST",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036018-25f65c4d-a968-4c6c-b328-15958acdb649.png",
}

const setsuko: CreateAccountParams = {
  address: "0x4038d6B8fa427812869cf406BaD5041D31F0a17C",
  name: "setsuko",
  pronouns: "she/her",
  skills: [],
  discordId: "setsuko#4214",
  timezone: "EST",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036018-25f65c4d-a968-4c6c-b328-15958acdb649.png",
}

const seed = async () => {
  console.log("Seeding Accounts")
  const users = [kristen, chiyoko, setsuko]
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
