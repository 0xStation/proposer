# Tech Debt

## Decimal field on Check model

Checks use a `Decimal` column to store `tokenAmount`, the amount of tokens being issued in the check.
Prisma's `Decimal` is stored under the hood as a `decimal(65,30)` postgres column ((prisma docs))[https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#decimal] where `65` refers to the precision of the number (how many digits + decimals stored at once) and `30` refers to the maximum number of decimals.

65 base-10 precision is just above 208 base-2 precision which means solidity numbers of size greater than `uint208` cannot be stored in this `Decimal` column.

Token balances are represented as `uint256` in solidity (78 base-10 precision) so we lose support at incredibly high numbers. The likelihood that such numbers are being written on checks is incredibly low, but we should plan around and understand this shortcoming.

My recommendatoin is that we pursue the `Decimal` column despite its shortcomings because it enables database-level math (sums) which are immediately useful for the application. For now at the UI level, we should prevent numbers >35 digit numbers which guarantees safety of postgres's column restriction and is the easiest solution without sacrificing 99.99% use cases. Mechanisms exist for us to squeeze even more usable digits out of this column which we can figure out and implement as we encounter pressing user needs, but none of this should be an issue for our users unless someone is trying to break our database intentionally.

One such mechanism is that for tokens that use >=13 decimals AND they do not use 13 of them, we can support full range of that tokens balance. For example, ETH (and most tokens) use 18 decimals which means if they practically don't use more than 5 of them (likely), then we can store the entire number safely (78 digits - 13 unused = 65 available). In this example, only using 5 decimals sets 0.00001 ETH as the incremental unit, which for $10k/ETH is equal to $0.10 which is unlikely to be the precision checks are written at. Even at $100K/ETH, this precision is $1 which we can wrangle with not supporting. These estimations are an effort to show that we just need to buy time to fix the problem in a pure sense (6-9 months).
