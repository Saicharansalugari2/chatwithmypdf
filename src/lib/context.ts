import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    console.log("🔵 Initializing Pinecone client...");
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!, // Removed environment property
    });

    const indexName = process.env.PINECONE_INDEX_NAME || "chatwithmypdf"; // Use the index name from environment variable
    console.log(`🟢 Using Pinecone index: ${indexName}`);

    // Get the index directly by name
    const pineconeIndex = client.index(indexName);

    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

    console.log("🔎 Querying Pinecone with embeddings...");
    const queryResult = await namespace.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });

    console.log("✅ Query result:", queryResult);
    return queryResult.matches || [];
  } catch (error) {
    console.error("❌ Error querying embeddings:", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  try {
    console.log("📝 Generating query embeddings...");
    const queryEmbeddings = await getEmbeddings(query);

    console.log("🔍 Fetching matching documents...");
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

    const qualifyingDocs = matches.filter(
      (match) => match.score && match.score > 0.7
    );

    type Metadata = {
      text: string;
      pageNumber: number;
    };

    let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
    return docs.join("\n").substring(0, 3000);
  } catch (error) {
    console.error("❌ Error in getContext:", error);
    throw error;
  }
}
