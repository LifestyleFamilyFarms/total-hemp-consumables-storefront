import type { NextApiRequest } from 'next';

export async function POST(
  req: NextApiRequest,
) {
  return Response.json({ message: 'Hello from Next.js!' })
}


export async function GET(
  req: NextApiRequest,
) {
  return Response.json({ message: "Hello from API!" })
}