import { locationModule } from "./modules/location"

export const genProposalApprovalDigest = ({ proposalId, proposalHash, proposalVersion }) => {
  return {
    domain: {
      // name aka feature name -
      // we're using schema-based versioning here.
      // The idea is everything that should have its own api + versioning
      // should have a domain. Keep hardcoded
      name: "ProposalSignature", // keep hardcoded
      version: "0.1.0", // references the web app's version
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
      ProposalApproval: [
        // core
        { name: "signedAt", type: "uint256" }, // UNIX timestamp for when this data was signed
        { name: "proposalId", type: "string" }, // uuid
        { name: "proposalVersion", type: "uint256" }, // denotes a proposal's editing history version
        { name: "proposalHash", type: "string" }, // typed data hash as defined by EIP712, implemented with ether's _TypedDataEncoder
        // schema defintiions
        { name: "type", type: "Type" },
        { name: "modules", type: "Module[]" },
        // module fields
        { name: "location", type: "Location" }, // when
      ],
    },
    value: {
      signedAt: Date.now(),
      proposalId,
      proposalVersion,
      proposalHash,
      // schema
      type: {
        key: "approval",
        version: "1.0",
      },
      modules: [
        {
          key: "location",
          version: "1.0",
          name: "location",
          array: false,
        },
      ],
      // module fields
      location: {
        // Hardcoding our app name. Other frontend app's can change this type
        // to reference where the data was generated down the road.
        app: "Station",
      },
    },
  }
}
