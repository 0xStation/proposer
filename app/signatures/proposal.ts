import { Proposal } from "app/proposal/types"
import decimalToBigNumber from "app/core/utils/decimalToBigNumber"
import { locationModule } from "./modules/location"
import { roleModule } from "./modules/role"
import { contentModule } from "./modules/content"
import { milestoneModule } from "./modules/milestone"
import { paymentModule } from "./modules/payment"
import { tokenModule } from "./modules/token"

export const genProposalDigest = (proposal: Proposal) => {
  return {
    domain: {
      // name aka feature name -
      // we're using schema-based versioning here.
      // The idea is everything that should have its own api + versioning
      // should have a domain. Keep hardcoded
      name: "Proposal",
      // use semver versioning https://semver.org/
      version: "0.0.1",
    },
    types: {
      Type: [
        { name: "key", type: "string" },
        { name: "version", type: "string" },
      ],
      Module: [
        { name: "key", type: "string" },
        { name: "version", type: "string" },
        { name: "name", type: "string" },
        { name: "array", type: "bool" },
      ],
      // module schemas
      ...locationModule,
      ...roleModule,
      ...contentModule,
      ...milestoneModule,
      ...paymentModule,
      ...tokenModule,
      Proposal: [
        { name: "signedAt", type: "uint256" }, // UNIX timestamp for when this data was signed
        { name: "proposalId", type: "string" }, // UUID to identify this proposal, used to connect audit trail for version history
        // schema defintiions
        { name: "type", type: "Type" },
        { name: "modules", type: "Module[]" },
        // module fields
        { name: "location", type: "Location" }, // where
        { name: "roles", type: "Role[]" }, // who
        { name: "content", type: "Content" }, // what
        { name: "milestones", type: "Milestone[]" }, // how
        { name: "payments", type: "Payment[]" }, // how
        { name: "tokens", type: "Token[]" }, // supporting metadata for payment tokens
      ],
    },
    value: {
      // core
      signedAt: Date.now(),
      proposalId: proposal.id,
      // schema
      type: {
        key: "funding",
        version: "1.0",
      },
      modules: [
        {
          key: "location",
          version: "1.0",
          name: "location",
          array: false,
        },
        {
          key: "role",
          version: "1.0",
          name: "roles",
          array: true,
        },
        {
          key: "content",
          version: "1.0",
          name: "content",
          array: false,
        },
        {
          key: "milestone",
          version: "1.0",
          name: "milestones",
          array: true,
        },
        {
          key: "payment",
          version: "1.0",
          name: "payments",
          array: true,
        },
        {
          key: "token",
          version: "1.0",
          name: "tokens",
          array: true,
        },
      ],
      // module fields
      location: {
        // Hardcoding our app name. Other frontend app's can change this type
        // to reference where the data was generated down the road.
        app: "Station",
      },
      roles: proposal.roles?.map((role) => {
        return { roleId: role.id, address: role.address, type: role.type }
      }),
      content: {
        title: proposal.data.content.title,
        oneLiner: "", // placeholder for now, may be used by our app in future, but common pattern for other apps
        body: proposal.data.content.body,
      },
      milestones: (proposal.milestones || []).map((milestone) => {
        return {
          milestoneId: milestone.id,
          index: milestone.index,
          title: milestone.data.title,
        }
      }),
      payments: (proposal.payments || []).map((payment) => {
        const token = payment.data.token
        return {
          paymentId: payment.id,
          milestoneId: payment.milestoneId,
          recipientAddress: payment.recipientAddress,
          // uint256 has max integer size of 2^256 - 1, but js/ts can only handle 2^53 so we need a more scalable representation
          // ether's BigNumber is great for this, but looks funny when placing within a JSON file so we opt for the string representation
          // strings are more interoperable because they are language agnostic and human readable
          // wagmi can also parse strings just fine into the uint256 representation needed for EIP712 signatures
          amount: decimalToBigNumber(payment.amount!, token.decimals || 0).toString(),
          chainId: token.chainId,
          tokenAddress: token.address,
        }
      }),
      tokens: (proposal.payments || [])
        ?.map((payment) => {
          const token = payment.data.token
          return {
            chainId: token.chainId,
            address: token.address,
            type: token?.type || "",
            name: token?.name || "",
            symbol: token?.symbol || "",
            decimals: token?.decimals || 0,
          }
        })
        .filter((token, i, tokens) => tokens.indexOf(token) === i), // filter out duplicate tokens
    },
  }
}
