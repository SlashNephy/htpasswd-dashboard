import { loadServices } from '../../lib/services'

import type { Service } from '../../lib/services'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler<Service[]> = async (req, res) => {
  res.status(200).json(await loadServices())
}

export default handler
