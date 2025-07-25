export async function askGreenPolicyRAG(question) {
  const response = await fetch('/api/rag/green-policy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question })
  });

  if (!response.ok) {
    throw new Error('Failed to get answer from RAG advisor');
  }

  const data = await response.json();
  return data.answer;
} 