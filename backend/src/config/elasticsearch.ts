import { Client } from '@elastic/elasticsearch';
import { env } from './env';

// Initialize Elasticsearch client
export const esClient = new Client({
  node: env.ELASTICSEARCH_URL,
});

/**
 * Ensures the required Elasticsearch index for emails exists with proper mappings.
 */
export async function ensureEmailIndex() {
  try {
    const indexExists = await esClient.indices.exists({ index: env.ELASTICSEARCH_INDEX });
    
    if (!indexExists) {
      await esClient.indices.create({
        index: env.ELASTICSEARCH_INDEX,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              userId: { type: 'keyword' },
              recipientEmail: { type: 'keyword' },
              subject: { type: 'text' },
              body: { type: 'text' },
              senderEmail: { type: 'keyword' },
              status: { type: 'keyword' },
              scheduledAt: { type: 'date' },
              sentAt: { type: 'date' }
            }
          }
        }
      });
      console.log(`✅ Elasticsearch index '${env.ELASTICSEARCH_INDEX}' created`);
    } else {
      console.log(`✅ Elasticsearch index '${env.ELASTICSEARCH_INDEX}' already exists`);
    }
  } catch (error) {
    console.error('❌ Failed to create Elasticsearch index:', error);
  }
}
