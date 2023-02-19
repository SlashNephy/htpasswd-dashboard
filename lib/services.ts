export type Service = {
  key: string
  name: string
  url: string
  imageUrl: string
  apiUrl: string
  exampleApiUrl: string
}

export const services: Service[] = [
  {
    key: 'mirakurun',
    name: 'Mirakurun',
    url: 'https://mirakurun.starry.blue',
    imageUrl: '/mirakurun.webp',
    apiUrl: 'https://mirakurun-api.starry.blue/api',
    exampleApiUrl: 'https://mirakurun-api.starry.blue/api/status',
  },
  {
    key: 'epgstation',
    name: 'EPGStation',
    url: 'https://epgstation.starry.blue',
    imageUrl: '/epgstation.jpeg',
    apiUrl: 'https://epgstation-api.starry.blue/api',
    exampleApiUrl: 'https://epgstation-api.starry.blue/api/version',
  },
]
