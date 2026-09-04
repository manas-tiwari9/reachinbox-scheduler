import { esClient } from '../config/elasticsearch';
import { env } from '../config/env';
import { EmailJob } from '@prisma/client';

/**
 * Indexes or updates an email job document in Elasticsearch.
 */
export async function indexEmail(job: EmailJob): Promise<void> {
  try {
    await esClient.index({
      index: env.ELASTICSEARCH_INDEX,
      id: job.id,
      document: {
        id: job.id,
        userId: job.userId,
        recipientEmail: job.recipientEmail,
        subject: job.subject,
        body: job.body,
        senderEmail: job.senderEmail,
        status: job.status,
        scheduledAt: job.scheduledAt.toISOString(),
        sentAt: job.sentAt?.toISOString()
      },
    });
  } catch (error) {
    console.error(`❌ Failed to index email ${job.id} in ES:`, error);
  }
}

/**
 * Full-text search on emails for a user.
 */
export async function searchEmails(userId: string, query: string, from = 0, size = 10): Promise<{ hits: any[]; total: number }> {
  try {
    const response = await esClient.search({
      index: env.ELASTICSEARCH_INDEX,
      from,
      size,
      query: {
        bool: {
          must: [
            { term: { userId } },
            {
              multi_match: {
                query,
                fields: ['subject', 'body'],
                fuzziness: 'AUTO'
              }
            }
          ]
        }
      }
    });

    return {
      hits: response.hits.hits.map(hit => hit._source),
      total: typeof response.hits.total === 'number' ? response.hits.total : response.hits.total?.value || 0
    };
  } catch (error) {
    console.error('❌ Failed to search emails in ES:', error);
    return { hits: [], total: 0 };
  }
}

/**
 * Deletes an email document from the Elasticsearch index.
 */
export async function deleteEmailIndex(id: string): Promise<void> {
  try {
    await esClient.delete({
      index: env.ELASTICSEARCH_INDEX,
      id,
    });
  } catch (error) {
    console.error(`❌ Failed to delete email ${id} from ES:`, error);
  }
}
