const path = require("path");
const k = require("@metaplex-foundation/kinobi");

const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

const kinobi = k.createFromIdls([path.join(idlDir, "nft_staking.json")]);

const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = path.join(clientDir, "js", ".prettierrc.json");
kinobi.accept(new k.RenderJavaScriptVisitor(jsDir, { prettier }));