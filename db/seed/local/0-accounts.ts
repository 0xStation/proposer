import db from "../../index"
import { invoke } from "blitz"
import createAccount from "app/account/mutations/createAccount"

interface Skill {
  value: string
  label: string
}

interface CreateAccountParams {
  name: string
  bio: string
  timezone: string
  skills: Skill[]
  address: string
  pfpURL?: string
  contactURL: string
  coverURL?: string
  discordId?: string
}

const kristen: CreateAccountParams = {
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  name: "rie",
  bio: "a great dev",
  skills: [],
  timezone: "PST",
  contactURL: "twitter.com",
  coverURL: "",
  pfpURL: "https://pbs.twimg.com/profile_images/1504696320509964292/ERRqUjIa_400x400.jpg",
  discordId: "rie#9502",
}

const hardhat: CreateAccountParams = {
  address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  name: "hardhat",
  bio: "local dev!",
  skills: [],
  timezone: "EST",
  contactURL: "twitter.com",
  coverURL: "",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036018-25f65c4d-a968-4c6c-b328-15958acdb649.png",
}

const chiyoko: CreateAccountParams = {
  address: "0x1E8f3C0286b4949e8eB1F5d705b49016dc84D288",
  name: "chiyoko",
  bio: "local dev!",
  skills: [],
  timezone: "EST",
  contactURL: "twitter.com",
  coverURL: "",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036018-25f65c4d-a968-4c6c-b328-15958acdb649.png",
}

const setsuko: CreateAccountParams = {
  address: "0x4038d6B8fa427812869cf406BaD5041D31F0a17C",
  name: "setsuko",
  bio: "also a great movie star",
  skills: [],
  timezone: "EST",
  contactURL: "twitter.com",
  coverURL: "",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036018-25f65c4d-a968-4c6c-b328-15958acdb649.png",
}

const seed = async () => {
  console.log("Seeding Accounts")
  const users = [kristen, chiyoko, setsuko, hardhat]
  for (const name in users) {
    const contributorData = users[name] as CreateAccountParams
    const account = await db.account.findUnique({
      where: { address: contributorData.address },
    })

    if (account) {
      continue
    }

    await invoke(createAccount, { ...contributorData })
  }
}

export default seed
