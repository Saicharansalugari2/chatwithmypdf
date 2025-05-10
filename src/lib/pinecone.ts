import { Pinecone } from '@pinecone-database/pinecone'; // Corrected import for the Pinecone class
import { downloadFromS3 } from './s3-server';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter';
import { getEmbeddings } from './embeddings';
import md5 from 'md5';
import { convertToAscii } from './utils';

type PDFPage = {
    pageContent: string;
    metadata: {
        loc: { pageNumber: number }
    }
}

type Vector = {
    id: string;
    values: any;  // Specify the appropriate type for values
    metadata: {
        text: string;
        pageNumber: number;
    }
}

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
    if (!pinecone) {
        if (!process.env.PINECONE_API_KEY) {
            throw new Error("Missing Pinecone API Key");
        }

        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY! // Removed the environment property
        });
    }
    return pinecone;
};

export async function loadS3IntoPinecone(fileKey: string) {
    console.log('⏳ Downloading file from S3:', fileKey);
    const file_name = await downloadFromS3(fileKey);
    if (!file_name) throw new Error('❌ Could not download from S3');

    console.log('✅ File downloaded:', file_name);
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    console.log('📄 Number of pages loaded:', pages.length);

    const documents = await Promise.all(pages.map(prepareDocument));
    console.log('📄 Number of documents after splitting:', documents.length);

    const vectors = await Promise.all(documents.flat().map(embedDocument));
    console.log('🔢 Number of vectors generated:', vectors.length);

    const client = await getPineconeClient();
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX_NAME || 'chatwithmypdf'); // Use index name from environment variable
    const namespace = convertToAscii(fileKey);

    console.log('🚀 Inserting vectors into Pinecone...');
    await pineconeIndex.namespace(namespace).upsert(vectors);

    console.log('✅ Vectors inserted successfully into Pinecone!');

    return documents[0];
}

async function embedDocument(doc: Document) {
    try {
        const embeddings = await getEmbeddings(doc.pageContent);
        const hash = md5(doc.pageContent);
        return {
            id: hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
            }
        } as Vector;
    } catch (error) {
        console.log('error embedding document', error);
        throw error;
    }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder();
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
    let { pageContent, metadata } = page;
    pageContent = pageContent.replace(/\n/g, '');

    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000)
            }
        })
    ]);
    return docs;
}
