import nextConfigJs from '../next.config'

export type Service = {
  name: string
  url: string
  imageUrl: string
  apiUrl: string
  exampleApiUrl: string
}

export const services: Service[] = [
  {
    name: 'EPGStation',
    url: 'https://atmos.starry.blue',
    imageUrl: `${nextConfigJs.basePath}/epgstation.jpeg`,
    apiUrl: 'https://anemos.starry.blue/api',
    exampleApiUrl: 'https://anemos.starry.blue/api/version',
  },
  {
    name: 'Mirakurun',
    url: 'https://apps.starry.blue/mirakurun',
    imageUrl: `${nextConfigJs.basePath}/mirakurun.webp`,
    apiUrl: 'https://atmos.starry.blue/mirakurun',
    exampleApiUrl: 'https://atmos.starry.blue/mirakurun/status',
  },
]
